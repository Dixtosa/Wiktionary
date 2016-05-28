#!/usr/bin/python
# --coding: utf-8


# Description:		This script eases creation of Georgian terms on http://en.wiktionary.org
# Author:		Dixtosa
# Language:		Python 3
# Date created:		18 Feb 2012 (initial version)

import re, sys


letters="abgdevzTiklmnopJrstufqRySCcZwWxjh"
vowel = "aeiou"
consonants = "".join (set(letters) - set(vowel))


############# unofficial transliteration ################
def LAT_2_GEO(text):
	res = ""
	for i in text:
		if i in letters: res+=chr(4304+letters.index(i))
		else: res+=i
	return res
	

ENTRY = """==Georgian==

===Pronunciation===
* {{ka-IPA}}
* {{ka-hyphen}}

===%s===
{{%s%s}}

# %s
%s"""

def Generate_Content(
        Header,
        Template,
        plural,
        definition,
        DECLENSION
        ):
	plural = "|" + plural if plural != "" else ""
	return ENTRY % (Header, Template, plural, definition, DECLENSION)

Headers = ["Noun" ,"Adjective" ,"Verbal noun" ,"Adverb" ,"Interjection" ,"Verb" ,"Pronoun" ,"Proper noun" ,"Particle" ,"Phrase" ,"Postposition"]

Header2Template = {
"Noun" : "ka-noun",
"Adjective" : "ka-adj",
"Verbal noun" : "ka-verbal noun",
"Adverb" : "ka-adv",
"Interjection" : "head|ka|interjection",
"Verb" : "ka-verb",
"Verb*" : "head|ka|verb form",
"Pronoun" : "ka-pron",
"Proper noun" : "ka-proper_noun",
"Particle" : "head|ka|particle",
"Phrase" : "head|ka|phrase",
"Postposition" : "head|ka|postposition"
}

# noun and verb forms
Forms = ["Noun", "Verb"]


def GetDeclension(entry):
	arg1, arg2 = "", ""
	if not entry.hasPlural():
		arg1 = "|-"
	elif not entry.hasPredictablePlural():
		arg1 = "|" + plural[:-3]
	return "\n====Inflection====\n{{ka-infl-noun%s%s}}" % (LAT_2_GEO(arg1), LAT_2_GEO(arg2))

def AskPlural(term):
	ans = input("""
Does it have plural? 
	+ YES, is it different from: """ + term[:-1] + """ebi?
		- NO  : press enter
		
		- YES : type the exceptional plural
	- NO : type 'no'\n""")
	return "-" if ans == "ara" or ans == "no" else ans
	
	

# I admit this function is overcomplicated w/o any reason xD
def getPartOfSpeech():
	print("Choose part of speech:")

	for i, name in enumerate(Headers):
		print("%02d) %s" % (i+1, name + ("*" if name in Forms else "")))
	
	ans = re.match(r"(\d\d?)(\*?)$", input())
	if ans:
		d, ast = ans.groups()
		d = int(d) - 1
		if d < len(Headers):
			return Headers[d] + ast
	
	print("Doh come on it was easy. Try again...")
	sys.exit(0)

def open_browser(Word):
	import webbrowser, urllib.request, urllib.parse, urllib.error
	
	URL="http://en.wiktionary.org/w/index.php?title=%s&action=edit"

	webbrowser.open_new_tab(URL%(urllib.parse.quote_plus(LAT_2_GEO(Word))))


def Copy_To_Clipboard(content):
	from subprocess import Popen, PIPE, STDOUT
	subp = Popen(["clip"], stdout=PIPE,stdin=PIPE)
	subp.communicate(input = bytearray(content, "UTF-16")[2:]); #rm BOM?


def Getlexeme():
	return input ("lexeme: ")

def GenerateEnglishTranslation():
	Eng_trans = input ("English infinitive: ")
	conj = "\n\n====Conjugation====\n{{ka-conj-transitive-ablaut\n|stem =\n|ablaut =\n|preverb =\n|versioner=\n|SNM=\n}}"
	return "She/he/it [[" + Eng_trans+"]]s, is [["+Eng_trans+"]]ing" + conj



def Generate_Verb_Definition():
	lexeme=LAT_2_GEO(Getlexeme())
	ans = int(input("1) 1\n2) 2\n3) 3\n"))
	plurality=int(input("1) Singular\n2) Plural:\n"))
	#persons = ["First", "Second", "Third"]
	plurality_list = ["sg", "pl"]
	#time = ["Present indicative", "Imperfect", "Present subjunctive", "Future indicative", "Conditional", "Future subjunctive",
        #        "Aorist indicative", "Optative",
        #        "Perfect", "Pluperfect", "Perfect subjunctive"]
	text = "{{ka-verb-form-of|"+str(ans)+"|"+plurality_list[plurality-1]
	ans_time = int(input("""
1) awmyo			ras shvreba?	[axlandeli]
2) uwyveteli			ras shvreboda?
3) awmyos kavSirebiTi		ras shvrebodes?
4) myofadi			ras izams?	[momavali]
5) xolmeobiTi SedegobiTi	ras izamda?
6) myofadis kavSirebiTi		ras izamdes?
----------
7) wyvetili.			ra qna?		[warsuli]
8) wyvetilis kavSirebiTi	ra qnas?
----------
9)  I TurmeobiTi		ra uqnia?
10) II TurmeobiTi		ra eqna?
11) III TurmeobiTi		ra eqnas?
"""))
                  
	text+="|"+str(ans_time)+"|"+lexeme+"}}"
	
	return text

def getHeadwordTemplate(partOfSpeech):
	last = partOfSpeech[-1]
	if last == "*" and partOfSpeech in Forms:
		return "ka|head|%s form" % (partOfSpeech.lower())
	else:
		return Header2Template[partOfSpeech]

def getDefinition(partOfSpeech):
	if partOfSpeech == "Verb*": #verb form
		return Generate_Verb_Definition()
	elif partOfSpeech == "Verb":
		return GenerateEnglishTranslation()
	elif partOfSpeech == "Verbal noun":
		return "{{ka-verbal for|" + LAT_2_GEO(input ("Lemma: ")) + "}}"
	else:
		# ugly but cool XD
		ans = input("In English (separate with , and ;):").replace(";", "]]\n# [[")
		return "[[" + ans.replace(",", "]], [[") + "]]"

class GenericWord(object):
	def __init__(self, term):
		self.term = term
		self.partOfSpeech = None
		self.definitionLine = None
	def run(self):
		pass
	def generateContent(self):
		if self.plural != "":
			self.plural = "|" + self.plural
		
		return self.entryTemplate % (self.partOfSpeech, self.headwordTemplate, self.plural, self.definitionLine, self.declension)

class Noun:
	def __init__(self, term):
		self.term = term
	def setPartOfSpeech(self, partOfSpeech):
		self.partOfSpeech = partOfSpeech
	def run(self):
		self.definition = getDefinition(self.partOfSpeech)
		self.headwordTemplate = getHeadwordTemplate(self.partOfSpeech)
		
		if self.partOfSpeech in ["Noun", "Proper noun"]:
			self.plural = self.getPlural()
			self.declension = "" or GetDeclension(self)
	def generateContent(self):
		return Generate_Content(
			self.partOfSpeech.replace("*", ""),
			self.headwordTemplate,
			LAT_2_GEO(self.plural),
			self.definition,
			self.declension
		)
	def hasPlural(self):
		return self.plural != "-"
	def getPlural(self):
		ans = AskPlural(self.term)
		return self.guessPlural() if ans == "" else ans
	def guessPlural(self):
		if self.term[-1] in "ia":
			return self.term[:-1] + "ebi"
		if self.term[-1] in "eou":
			return self.term + "ebi"
	def hasPredictablePlural(self):
		return self.guessPlural() == self.plural
		
class Adjective:
	pass
class VerbalNoun:
	pass
class Verb:
	pass
class Pronoun:
	pass
class Wordform:
	pass

header2class = {
"Noun"		:	Noun,
"Adjective"	:	Adjective,
"Verbal	noun"	:	VerbalNoun,
"Adverb"	:	GenericWord,
"Interjection"	:	GenericWord,
"Verb"		:	Verb,
"Pronoun"	:	Pronoun,
"Proper	noun"	:	Noun,
"Particle"	:	GenericWord,
"Phrase"	:	GenericWord,
"Postposition"	:	GenericWord,

"Noun*"		:	Wordform,
"Verb*"		:	Wordform
}

def Main():
	partOfSpeech = getPartOfSpeech()
	posClass = header2class[partOfSpeech]
	
	term = input("Input the term: ") #Input in the Latin script, but use unofficial romanization; see http://en.wikipedia.org/wiki/Romanization_of_Georgian

	entry = posClass(term)
	entry.setPartOfSpeech(partOfSpeech)
	entry.run()
	content = entry.generateContent()
	#print (content)
	Copy_To_Clipboard(content)
	open_browser(term)


Main()
