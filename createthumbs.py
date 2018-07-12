from PIL import Image
import os

contents = os.listdir("./block-media")
if not os.path.exists("./block-media/thumbs"):
    os.makedirs("./block-media/thumbs")
size = 500,500
for file in contents:
    if file.lower().find(".png") != -1 or file.lower().find(".jpg") != -1:
        e = "PNG" if file.lower().find(".png") else "JPEG"
        f = Image.open("./block-media/"+file)
        f.thumbnail(size, Image.ANTIALIAS)
        f.save("./block-media/thumbs/"+file, e)
        print "Created thumb for " + file
