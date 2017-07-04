function tokenize(str){
	const NONE=0
	const LINE_COMMENT=1
	const DEFINE=2
	const STRING=3
	const BRACKET_STRING=4
	const DECLARATION=5
	const IDENTIFIER=6
	const MULTI_LINE_COMMENT=7
	const NUMBER=8

	var position=0
	var state=NONE
	var results=[]
	var buf=""
	var column=0;
	var line=1

	function read(){
		if(position<str.length){
			var ch=str.charAt(position++);
			if(ch==="\n"){
				line++
				column=1
			}else{
				column++
			}
			return ch
		}else{
			return -1
		}
	}

	function collectToken(type){
		results.push({
			str:buf,
			line:line,
			column:column,
			type:type
		})
		buf=""
	}

	function isWhiteSpace(ch){
		if(ch===' ')return true
		if(ch==='\t')return true
		if(ch==='\n')return true
		if(ch==='\r')return true
		// TODO: we might want to add other valid escape codes
		return false
	}

	function isDigit(ch){
		if(ch==='0')return true
		if(ch==='1')return true
		if(ch==='2')return true
		if(ch==='3')return true
		if(ch==='4')return true
		if(ch==='5')return true
		if(ch==='6')return true
		if(ch==='7')return true
		if(ch==='8')return true
		if(ch==='9')return true
		return false
	}

	function isSymbol(ch){
		if(ch==='-')return true
		if(ch===':')return true
		if(ch==='(')return true
		if(ch===')')return true
		if(ch===';')return true
		if(ch==='*')return true
		if(ch==='+')return true
		if(ch===',')return true
		if(ch==='{')return true
		if(ch==='}')return true
		if(ch==='^')return true
		if(ch==='=')return true
		// TODO: this list is definitely missing symbols... find a proper objective c header syntax definition
		return false
	}

	function unescapeChar(ch){
		if(ch==='n')return '\n'
		if(ch==='r')return '\r'
		if(ch==='t')return '\t'
		return ch
	}

	function createError(str){
		return "at line "+line+" column "+column+" : "+str
	}

	var input=read()
	var stashed=null
	var escaped=false
	while(input!==-1){
		switch(state){
			case NONE:
				if(input==='/'){
					var tmp=read()
					if(tmp==='/'){
						state=LINE_COMMENT
					}else if(tmp==='*'){
						state=MULTI_LINE_COMMENT
					}else{
						throw createError("Unexpected character after /")
					}
				}else if(input==='#'){
					state=DEFINE
				}else if(input==='"'){
					state=STRING
				}else if(input==='<'){
					state=BRACKET_STRING
				}else if(input==='@'){
					var tmp=read()
					if(tmp==='"'){
						// objective c string literal
						state=STRING
					}else{
						buf+=tmp
						state=DECLARATION
					}
				}else if(input==='-'){
					var tmp=read()
					if(isDigit(tmp)){
						buf+='-'
						buf+=tmp
						state=NUMBER
					}else{
						stashed=tmp
						buf='-'
						collectToken("SYMBOL")
					}
				}else if(isDigit(input)){
					state=NUMBER
					buf+=input
				}else if(isWhiteSpace(input)){
					// Do nothing
				}else if(isSymbol(input)){
					buf=input
					collectToken("SYMBOL")
				}else{
					// must be a new identifier
					buf+=input
					state=IDENTIFIER
				}
				break
			case IDENTIFIER:
				if(isWhiteSpace(input)){
					collectToken("IDENTIFIER")
					state=NONE
				}else if(isSymbol(input)){
					collectToken("IDENTIFIER")
					buf=input
					collectToken("SYMBOL")
					state=NONE
				}else{
					buf+=input
				}
				break
			case LINE_COMMENT:
				if(input==="\n"){
					// end of comment
					collectToken("COMMENT")
					state=NONE
				}else{
					buf+=input
				}
				break
			case MULTI_LINE_COMMENT:
				if(input==='*'){
					var tmp=read()
					if(tmp==='/'){
						// end of multiline comment
						collectToken("COMMENT")
						state=NONE
					}else{
						buf+='*'
						buf+=tmp
					}
				}else{
					buf+=input
				}
				break
			case DEFINE:
				// TODO: correctly handle one line defines to be able to collect pragma marks and so forth
				if(isWhiteSpace(input)){
					// end of define
					collectToken("DEFINE")
					state=NONE
				}else{
					buf+=input
				}
				break
			case STRING:
				if(escaped){
					buf+=unescapeChar(input)
					escaped=false
				}else{
					if(input==='\\'){
						escaped=true
					}else if(input==='"'){
						// end of string
						collectToken("STRING")
						state=NONE
					}else{
						buf+=input
					}
				}
				break
			case BRACKET_STRING:
				if(escaped){
					buf+=unescapeChar(input)
					escaped=false
				}else{
					if(input==='\\'){
						escaped=true
					}else if(input==='>'){
						// end of string
						collectToken("BRACKET_STRING")
						state=NONE
					}else{
						buf+=input
					}
				}
				break
			case DECLARATION:
				if(isWhiteSpace(input)){
					collectToken("DECLARATION")
					state=NONE
				}else if(isSymbol(input)){
					collectToken("DECLARATION")
					buf=input
					collectToken("SYMBOL")
					state=NONE
				}else{
					buf+=input
				}
				break
			case NUMBER:
				if(isDigit(input) || input==='.'){
					buf+=input
				}else if(input==='e' || input==='E'){
					buf+=input
					var tmp=read()
					if(tmp==='-' || tmp==='+' || isDigit(tmp)){
						buf+=tmp
					}else{
						throw createError("Unexpected character in floating point number '"+tmp+"'")
					}
				}else{
					stashed=input
					collectToken("NUMBER")
					state=NONE
				}
				break
		}
		if(stashed===null){
			input=read()
		}else{
			input=stashed
			stashed=null
		}
	}
	if(state==LINE_COMMENT){
		collectToken("COMMENT")
	}
	return results
}

module.exports=function(source){
	var tokens=tokenize(source)

	return {
		tokens:tokens
	}
}