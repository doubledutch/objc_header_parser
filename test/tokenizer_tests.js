var assert = require('assert');
var parse=require('../index.js')

describe('string tokenizing',function(){
	describe('single line comments',function(){
	  	var input="// My meaningful comment"
		var out=parse(input)
	    it('should have one token',function(){
			assert.equal(1,out.tokens.length)
	    });
	    it('should be a comment',function(){
	    	assert.equal("COMMENT",out.tokens[0].type)
	    });
	});
	describe('multi line comments',function(){
	  	var input="/* My even more meaningful comment\nWith random / and maybe even // and finally */"
		var out=parse(input)
	    it('should have one token',function(){
			assert.equal(1,out.tokens.length)
	    });
	    it('should be a comment',function(){
	    	assert.equal("COMMENT",out.tokens[0].type)
	    });
	});

  	describe('import tokenizing',function(){
	  	var input='#import "foo.h"'
		var out=parse(input)
	    it('should have two tokens',function(){
			assert.equal(2,out.tokens.length)
	    });
	    it('should be a define statement',function(){
	    	assert.equal("DEFINE",out.tokens[0].type)
	    });
	    it('should be import',function(){
	    	assert.equal("import",out.tokens[0].str)
	    });
	    it('should be a string',function(){
	    	assert.equal("STRING",out.tokens[1].type)
	    });
	    it('should be foo.h',function(){
	    	assert.equal("foo.h",out.tokens[1].str)
	    });
	});
	describe('import tokenizing with brackets',function(){
	    var input='#import <foo.h>'
		var out=parse(input)
	    it('should have two tokens',function(){
			assert.equal(2,out.tokens.length)
	    });
	    it('should be a define statement',function(){
	    	assert.equal("DEFINE",out.tokens[0].type)
	    });
	    it('should be import',function(){
	    	assert.equal("import",out.tokens[0].str)
	    });
	    it('should be a string',function(){
	    	assert.equal("BRACKET_STRING",out.tokens[1].type)
	    });
	    it('should be foo.h',function(){
	    	assert.equal("foo.h",out.tokens[1].str)
	    });
	});
	describe('class desclaration',function(){
	  	var input="@class Foo_Bar, Baz;"
		var out=parse(input)
	    it('should have five tokens',function(){
			assert.equal(5,out.tokens.length)
	    });
	    it('should be a declaration',function(){
	    	assert.equal("DECLARATION",out.tokens[0].type)
	    	assert.equal("class",out.tokens[0].str)
	    });
	    it('should be an identifier',function(){
	    	assert.equal("IDENTIFIER",out.tokens[1].type)
	    	assert.equal("Foo_Bar",out.tokens[1].str)
	    });
	    it('should be a symbol',function(){
	    	assert.equal("SYMBOL",out.tokens[2].type)
	    	assert.equal(",",out.tokens[2].str)
	    });
	    it('should be an identifier',function(){
	    	assert.equal("IDENTIFIER",out.tokens[3].type)
	    	assert.equal("Baz",out.tokens[3].str)
	    });
	    it('should be a symbol',function(){
	    	assert.equal("SYMBOL",out.tokens[4].type)
	    	assert.equal(";",out.tokens[4].str)
	    });
	});
	describe('property desclaration',function(){
	  	var input="@property (nonatomic) UIColor* primaryColor;"
		var out=parse(input)
	    it('should have eight tokens',function(){
			assert.equal(8,out.tokens.length)
	    });
	    it('should be a declaration',function(){
	    	assert.equal("DECLARATION",out.tokens[0].type)
	    	assert.equal("property",out.tokens[0].str)
	    });
	    it('should be a symbol',function(){
	    	assert.equal("SYMBOL",out.tokens[1].type)
	    	assert.equal("(",out.tokens[1].str)
	    });
	});

	describe('C style enum',function(){
	  	var input="enum {\n"+
	  		"/// The remote URL is not being tracked\n"+
			"kDDFCacheErrorNotTracked = -100,\n"+
  			"/// The URL is already being tracked\n"+
			"kDDFCacheErrorAlreadyTracked = -101\n"+
			"}\n"
		var out=parse(input)
		// console.log(JSON.stringify(out,null,2))
	    it('should have twelve tokens',function(){
			assert.equal(12,out.tokens.length)
	    });
	    it('should be an identifier',function(){
	    	assert.equal("IDENTIFIER",out.tokens[0].type)
	    	assert.equal("enum",out.tokens[0].str)
	    });
	});

	describe('objective-c string literal',function(){
	  	var input='static NSString* const kChatRoomTypeGroup = @"GROUP";'
		var out=parse(input)
	    it('should have eight tokens',function(){
			assert.equal(8,out.tokens.length)
	    });
	    
	});
});
