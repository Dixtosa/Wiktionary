import urllib
import urllib2
import os.path
import mechanize
import cookielib

# Date created : Do not remember xD
# Purpose      : Provides functions to non-manually create an article on wiktionary
# Dependencies : Mechanize (browser simulator) 
#                - use the following command to install it: $ sudo pip install mechanize

br = mechanize.Browser()
cj = cookielib.LWPCookieJar(); br.set_cookiejar(cj)
br.set_handle_equiv(True); br.set_handle_gzip(False); br.set_handle_redirect(True); br.set_handle_referer(True); br.set_handle_robots(False)
br.set_handle_refresh(mechanize._http.HTTPRefreshProcessor(), max_time=1)
br.addheaders = [('User-agent', 'Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9.0.1) Gecko/2008071615 Fedora/3.0.1-1.fc9 Firefox/3.0.1')]
br.open('http://en.wiktionary.org/w/index.php?title=Special:UserLogin')
br.select_form(nr=0)


loggedIn = False
username = "Dixtosa"
password = ":P"

def login():
	global loggedIn
	br.form['wpName'] = username
	br.form['wpPassword'] = password
	br.form['wpRemember'] = ['1',]
	sub = br.submit()
	result = sub.read()

	if result.find ("Login successful")>=0:
		loggedIn = True

	print "* Login is %ssuccessful" % ("" if loggedIn else "un")


def Exists(word):
	try:
		br.open("http://en.wiktionary.org/wiki/" + urllib.quote_plus(word.encode ("utf-8")))
		return True
	except urllib2.HTTPError:
		return False

def Make_Entry_on_Wiktionary(Word, Entry_Content):
	if not loggedIn:
		login()
	if Exists(Word):
		print "The word already exists.\n Quitting."
		return
	
	URL = "http://en.wiktionary.org/w/index.php?title=%s&action=edit"
	my_string_list = {'wpAntispam': '',
		"wpTextbox1" : Entry_Content}
	
	#print LAT_2_GEO (Word); #URL%(urllib.quote_plus(Word.encode ("utf-8")))
	br.open (URL%(urllib.quote_plus(Word.encode ("utf-8"))))
	br.select_form(nr=0)
	
	for i in my_string_list:
		br.form[i] = my_string_list[i]
	br.submit()
	return True