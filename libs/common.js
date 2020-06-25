'use strict'

exports.randomString = function randomString(length) {
	let chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
	let string_length = length;
	let randomstring = '';
	for (let i=0; i<string_length; i++) {
		let rnum = Math.floor(Math.random() * chars.length);
		randomstring += chars.substring(rnum,rnum+1);
	}
	return randomstring;
}

exports.makeArray = function makeArray(obj){
	let isArray = Array.isArray(obj)
	let tempArray = []
	if(typeof obj === 'undefined' || obj === null || obj === ''){
		return tempArray
	}else if(isArray){
		tempArray = obj
	}else{
		tempArray.push(obj)
	}
	return tempArray
}
