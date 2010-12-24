#!/usr/bin/env python

from google.appengine.ext import webapp
from google.appengine.ext import db
from google.appengine.ext.webapp import util
from google.appengine.api import memcache

class Channels(db.Model):
  name = db.StringProperty()
  token = db.StringProperty()
  date = db.DateTimeProperty(auto_now_add=True)


#http://stackoverflow.com/questions/2350454/simplest-way-to-store-a-value-in-google-app-engine-python
class Link(db.Model):
  val = db.TextProperty()
  modify = db.StringProperty()
  date = db.DateTimeProperty(auto_now_add=True)
  size = db.IntegerProperty()
  name = db.StringProperty()
  host = db.StringProperty()
  
  
  @classmethod
  def get(cls, key):
    return cls.get_by_key_name(key)
  
  @classmethod
  def create(cls, size = None, name = None, host = None):
    letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    import random
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
    (name, code) = Link.create(name = self.request.get('name','untitled'), host = self.request.get('host','the internets'), size = long(self.request.get('size','0')));
    self.response.headers['content-type'] = 'text/plain'
    self.response.out.write(name +','+code)
    
class MainHandler(webapp.RequestHandler):
  def get(self):
    self.redirect("https://chrome.google.com/webstore/detail/bjgjolhpdlgebodaapdafhdnikagbfll")
    #self.response.out.write('This is the drag2up specialized URL shortening service.')

class UpdateHandler(webapp.RequestHandler):
  def get(self, name, code):
    from google.appengine.api import channel
    url = self.request.get('url')
    if Link.set(name, code, url) is True:
      self.response.out.write('done')
      #stupid channel api makes everything needlessly complicated
      query = Channels.all().filter('name =', name)
      results = query.fetch(1000)
      from google.appengine.api import channel
      for viewer in results:
        channel.send_message(viewer.token, url)
        viewer.delete()
    else:
      self.response.out.write('fail')

class PollHandler(webapp.RequestHandler):
  def get(self, name):
    self.response.out.write("nay" if Link.get(name) is None else "yay")
    
    
class CleanupHandler(webapp.RequestHandler):
  def get(self):
    import datetime  
    q = db.GqlQuery("SELECT * FROM Channels WHERE date < :1", datetime.datetime.now() - datetime.timedelta(hours = 2))
    db.delete(q.fetch(1000))
    
class LinkHandler(webapp.RequestHandler):
  def get(self, name):
    link = memcache.get(name)
    if link is not None:
      self.redirect(link)
    else:
      from google.appengine.ext.webapp import template
      entity = Link.get(name)
      if entity is None:
        self.error(404)
        self.response.out.write("""Nothing to see here. 
        I'm not capable of creating an interesting 404 page, 
        which seems to be a trend, so instead, I'll include this 
        self referential message about trends in 404 pages.""")
        return
      link = entity.val
      
      from datetime import datetime, timedelta
      import time
      
      if link is None and datetime.now() - entity.date > timedelta(hours = 2):
        link = "error: upload timeout. over two hours since uploading began."
        
      template_values = {
      'host': entity.host,
      'key': name,
      'name': entity.name,
      'nowdate': time.time(),
      'date': entity.date,
      'timestamp': time.mktime(entity.date.timetuple()),
      'size': entity.size,
      'link': link
      }
      

      import os
      if link is None:
        import random
        clientid = name+'uid'+str(random.random())
        Channels(name = name, token = clientid).put()
        template_values['token']  = channel.create_channel(clientid)
        path = os.path.join(os.path.dirname(__file__), 'uploading.html')
        self.response.out.write(template.render(path, template_values))
        
        return
        
      elif link.startswith("error:"):
        path = os.path.join(os.path.dirname(__file__), 'error.html')
        self.response.out.write(template.render(path, template_values))
        query = Channels.all().filter('name =', name)
        results = query.fetch(1000)
        for viewer in results:
          channel.send_message(viewer.token, link)
          viewer.delete()
      else:
        memcache.add(name, entity.val) #yay good data!
        self.redirect(link)
    
def main():
  application = webapp.WSGIApplication([('/', MainHandler),
                      ('/new', CreateHandler),
                      ('/update/(.*)/(.*)', UpdateHandler),
                      ('/poll/(.*)', PollHandler),
                      ('/tasks/channels', CleanupHandler),
                      ('/(.*)', LinkHandler)],
                     debug=True)
  util.run_wsgi_app(application)


if __name__ == '__main__':
  main()
