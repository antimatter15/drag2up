#!/usr/bin/env python

from google.appengine.ext import webapp
from google.appengine.ext import db
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp import util
from google.appengine.api import memcache
import random
import os

#http://stackoverflow.com/questions/2350454/simplest-way-to-store-a-value-in-google-app-engine-python
class Link(db.Model):
	val = db.StringProperty()
	modify = db.StringProperty()
	date = db.DateTimeProperty(auto_now_add=True)
	size = db.IntegerProperty()
	name = db.StringProperty()
	host = db.StringProperty()
	
	
	@classmethod
	def get(cls, key):
		return cls.get_by_key_name(key)
	
	#http://localhost:8080/new?size=4200000&host=tinypic&name=jesus.aXXo.x264.DvDrip.m4v	
	#localhost:8080/update/ksHu/CM0T?url=http://www.google.com
	
	@classmethod
	def create(cls, size = None, name = None, host = None):
		letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
		key = ''.join(random.choice(letters) for i in xrange(4))
		#secret passcode to allow editing
		code = ''.join(random.choice(letters) for i in xrange(4))
		entity = cls(key_name = key, modify = code, size = size, name = name, host = host)
		entity.put()
		return (key, code)
		
	@classmethod
	def set(cls, key, code, val):
		entity = cls.get_by_key_name(key)
		if entity.modify == code:
			entity.val = val
			entity.put()
			return True
		return False

class CreateHandler(webapp.RequestHandler):
	def get(self):
		(name, code) = Link.create(name = self.request.get('name'), host = self.request.get('host'), size = long(self.request.get('size','0')));
		self.response.headers['content-type'] = 'text/plain'
		self.response.out.write(name +','+code)
		
class MainHandler(webapp.RequestHandler):
	def get(self):
		self.redirect("https://chrome.google.com/extensions/detail/bjgjolhpdlgebodaapdafhdnikagbfll")
		#self.response.out.write('This is the drag2up specialized URL shortening service.')

class UpdateHandler(webapp.RequestHandler):
	def get(self, name, code):
		url = self.request.get('url')
		Link.set(name, code, url)
		memcache.add(name, url)
		self.response.out.write('done')

class PollHandler(webapp.RequestHandler):
	def get(self, name):
		self.response.out.write("nay" if memcache.get(name) is None else "yay")
		
class LinkHandler(webapp.RequestHandler):
	def get(self, name):
		link = memcache.get(name)
		if link is None:
			entity = Link.get(name)
			if entity.val is None:
				template_values = {
				'host': entity.host,
				'key': name,
				'name': entity.name,
				'date': entity.date,
				'size': entity.size,
				}
				
				path = os.path.join(os.path.dirname(__file__), 'uploading.html')
				self.response.out.write(template.render(path, template_values))
			else:
				memcache.add(name, entity.val)
				self.redirect(entity.val)
		else:
			self.redirect(link)
		
def main():
	application = webapp.WSGIApplication([('/', MainHandler),
										  ('/new', CreateHandler),
										  ('/update/(.*)/(.*)', UpdateHandler),
										  ('/poll/(.*)', PollHandler),
										  ('/(.*)', LinkHandler)],
										 debug=True)
	util.run_wsgi_app(application)


if __name__ == '__main__':
	main()
