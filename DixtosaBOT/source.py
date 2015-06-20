#!/usr/bin/env python
# -*- coding: utf-8 -*-

import pywikibot, re, execjs
from pywikibot import pagegenerators


site = pywikibot.Site()


nonlemma = pywikibot.Category(site,'Category:Georgian non-lemma forms')#"Category:Dixtosa's test category")
lemma = pywikibot.Category(site,'Category:Georgian lemmas')


gen_nonlemma = pagegenerators.CategorizedPageGenerator(nonlemma)
gen_lemma = pagegenerators.CategorizedPageGenerator(lemma)
#gen_ka_noun_c = pagegenerators.ReferringPageGenerator(pywikibot.Page(pywikibot.Link("Template:ka-noun-c-2", site)))


def correctIPA(wikitext):
	wikitext = re.sub(r"{{IPA\|.+?\|lang=ka}}", "{{ka-IPA}}", wikitext)
	return wikitext

def removeDecl(wikitext):
	wikitext = re.sub("\n====[ ]?Declension[ ]?====\n{{ka-decl-adj-auto}}", "", wikitext)
	wikitext = re.sub("\n====[ ]?Declension[ ]?====\n{{ka-adj-decl.*?}}", "", wikitext)
	return wikitext

def correctDecl(wikitext):
	wikitext = re.sub("====Declension====\n{{ka-noun-c\|.*plural.*}}", "====Inflection====\n{{ka-infl-noun|-}}", wikitext)
	wikitext = re.sub("====Declension====\n{{ka-noun-c\|.*}}", "====Inflection====\n{{ka-infl-noun}}", wikitext)
	
	wikitext = re.sub("====Declension====\n{{ka-noun-a\|.*plural.*}}", "====Inflection====\n{{ka-infl-noun|-}}", wikitext)
	wikitext = re.sub("====Declension====\n{{ka-noun-a\|.*}}", "====Inflection====\n{{ka-infl-noun}}", wikitext)
	
	wikitext = re.sub("====Declension====\n{{ka-noun-o\|.*plural.*}}", "====Inflection====\n{{ka-infl-noun|-}}", wikitext)
	wikitext = re.sub("====Declension====\n{{ka-noun-o\|.*}}", "====Inflection====\n{{ka-infl-noun}}", wikitext)
	
	wikitext = re.sub("====Declension====\n{{ka-noun-u\|.*plural.*}}", "====Inflection====\n{{ka-infl-noun|-}}", wikitext)
	wikitext = re.sub("====Declension====\n{{ka-noun-u\|.*}}", "====Inflection====\n{{ka-infl-noun}}", wikitext)
	
	wikitext = re.sub("====Declension====\n{{ka-noun-e\|.*plural.*}}", "====Inflection====\n{{ka-infl-noun|-}}", wikitext)
	wikitext = re.sub("====Declension====\n{{ka-noun-e\|.*}}", "====Inflection====\n{{ka-infl-noun}}", wikitext)
	
	wikitext = re.sub("====Declension====\n{{ka\-noun\-c\-2\|.*?\|.*?\|(.*?)\|.*plural.*}}", r"====Inflection====\n{{ka-infl-noun|\1|-}}", wikitext)
	wikitext = re.sub("====Declension====\n{{ka\-noun\-c\-2\|.*?\|.*?\|(.*?)\|.*}}", r"====Inflection====\n{{ka-infl-noun|\1}}", wikitext)
	return wikitext
	
def fixes(wikitext):
	wikitext = correctIPA(wikitext)
	wikitext = removeDecl(wikitext)
	wikitext = correctDecl(wikitext)
	
	f = open("scripts/myscript/code.js", "r"); source = f.read(); f.close();
	jscode = execjs.compile(source)
	wikitext = jscode.call("clean", wikitext);
	return wikitext

def run():
	count = 10
	for page in gen_lemma:
		if len(page.title()) < 3: continue
		page.text = fixes(page.text)
		page.save(u"minor edits (bot testing)")
		if count == 0:break
		count -= 1

def test():
	print fixes("""==Georgian==

===Etymology===
From {{etyl|el|ka}}

===Pronunciation===
* {{IPA|/ɑtʰlɛtʼɪ/|lang=ka}}

===Noun===
{{ka-noun|tr=at'leti|ათლეტები}}

# [[athlete]]

====Declension====
{{ka-noun-c|ათლეტ|at'let}}
""")

test()