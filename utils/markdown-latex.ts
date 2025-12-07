import markdownit from 'markdown-it';
import texmath from 'markdown-it-texmath';
import katex from 'katex';
import hljs from 'highlight.js';
const tm = texmath.use(katex);
export const md = markdownit({
        html: true,
        breaks: true,
        highlight: (str, lang) => {
            if (lang && hljs.getLanguage(lang)) {
                try { return hljs.highlight(str, { language: lang }).value; } catch (__) {}
            }
            return ''; 
        }
    }).use(tm, { delimiters: 'dollars', macros: {"\\RR": "\\mathbb{R}"} });


    /**
     * 核心算法：寻找安全的截断位置
     * 我们只在“双换行 (\n\n)”处进行截断，且必须保证：
     * 1. 不在代码块 (```) 内部
     * 2. 不在公式块 ($$) 内部
     * 这样可以防止切断 HTML 标签或破坏 KaTeX 解析
     */
    function findSafeSplitIndex(text) {
        // 如果文本太短，不处理，减少计算开销
        if (text.length < 10) return -1;

        // 我们倒序查找 "\n\n"，找到最后一个可能的截断点
        // 这样可以一次性提交尽可能多的内容
        const lastDoubleNewline = text.lastIndexOf('\n\n');
        
        if (lastDoubleNewline === -1) return -1;

        // 潜在截断点：双换行之后
        const potentialSplit = lastDoubleNewline + 2; 

        // 检查这个点是否“安全”
        // 截取从开头到这个点的文本
        const checkStr = text.slice(0, potentialSplit);

        // 统计代码块标记 ``` 的数量
        const codeBlockMatches = checkStr.match(/```/g);
        const codeBlockCount = codeBlockMatches ? codeBlockMatches.length : 0;

        // 统计公式标记 $$ 的数量
        // 注意：这里是一个简化检查，更严谨的需要区分转义符，但在流式渲染场景通常足够
        const mathBlockMatches = checkStr.match(/\$\$/g);
        const mathBlockCount = mathBlockMatches ? mathBlockMatches.length : 0;

        // 规则：
        // 如果 ``` 是偶数个，说明代码块已闭合（安全）
        // 如果 $$ 是偶数个，说明公式块已闭合（安全）
        // 如果都是偶数，则这是一个安全的截断点
        const isInsideCode = codeBlockCount % 2 !== 0;
        const isInsideMath = mathBlockCount % 2 !== 0;

        if (!isInsideCode && !isInsideMath) {
            return potentialSplit;
        }

        return -1; // 不安全，等待更多数据闭合标签
    }


class MarkdownLatex {
    processing: boolean; 
    committedHtml: string;
    content?: string;
    buffer: string;
    options: { speed: number; chunkSize: number; };
    intervalID: any;
    index: number;
    htmlFull: string;
    htmlSegment: string;
    ended: boolean;
    callback: (...args:string[]) => void;

    constructor(content:string = '', callback,option = {}) {
        this.processing = false;
        this.committedHtml = "";
        this.content = "";
        this.buffer = "";
        this.options = Object.assign({speed: 20, chunkSize: 4},option);
        this.intervalID = null
        this.index = 0;
        this.htmlFull = "";
        this.htmlSegment = "";
        this.parser = this.parser.bind(this);
        this.callback = callback

        if (content) this.add(content);
    }
    add(content:string,fullContent?:boolean){
        if (!content) return;
        if(fullContent){
            this.content = content;
        }else{  
            this.content = this.content + content;
        }
        if(!this.processing){
            this.start();
        }
    }
    start(){
        this.pause()
        this.ended = false
        if(this.options.speed){
            this.intervalID =  setInterval(this.parser,this.options.speed);
        }else{
            this.intervalID = window.requestAnimationFrame(this.parser);
        }
        this.processing = true
    }
    pause(){
        this.processing = false
        if(this.options.speed){
            clearInterval(this.intervalID);
        }else{
            cancelAnimationFrame(this.intervalID);
        }
        if(this.ended){
            this.finish()
        }
    }
    finish(){
        this.ended = true
        if(this.processing){
            return
        }
        if(this.buffer){
            let _html = md.render(this.buffer)
            this.callback(_html,'',this.htmlFull+_html,'')
        }
        this.reset()
    }
    reset(){
        this.index = 0
        this.content = ''
        this.buffer = ''
        this.processing = false
        this.htmlFull = ''
        this.htmlSegment = ''
    }
    parser(){
        console.log(this.index)
        let ChunkFull = '';//完整的块
        let curHtmlFull = '';
        let curHtmlSegment = '';
        if(this.index < this.content.length){
            let chunk = this.content.substring(this.index,this.index+this.options.chunkSize);
            this.index += chunk.length;
            ChunkFull = this.buffer + chunk;
            let safeIndex = findSafeSplitIndex(ChunkFull);
            if(safeIndex > 0){
                this.buffer = ChunkFull.substring(safeIndex);
                ChunkFull = ChunkFull.substring(0,safeIndex);
            }else{
                this.buffer = ChunkFull;
                ChunkFull = ''
            }
            if(ChunkFull.length){
                curHtmlFull = md.render(ChunkFull);
                this.htmlFull = this.htmlFull + curHtmlFull;
            }
            if(this.buffer.length){
                curHtmlSegment = md.render(this.buffer);
                this.htmlSegment = curHtmlSegment;
            }
            if(!this.options.speed){
                this.intervalID = requestAnimationFrame(this.parser)
            }
        }else{
            this.pause();
        }
        if(this.callback){
            this.callback(curHtmlFull,curHtmlSegment,this.htmlFull,this.htmlSegment)
        }
        if(!this.options.speed){
            requestAnimationFrame(this.parser)
        }
    }
    getHTML(){
        return [this.htmlFull + this.htmlSegment];
    }
}
export default MarkdownLatex

