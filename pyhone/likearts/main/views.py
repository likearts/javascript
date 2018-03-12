from django.shortcuts import render
from django.http import HttpResponse

from .models import Files

# Create your views here.
def main(request):
	data = {'message':'likearts'}
	return render(request, 'main/index.html', data )

def img(request,pk):
	try:
		image = Files.objects.get(pk=pk)
	except Files.DoesNotExist:
		return HttpResponse("사진이 없습니다.")
		
	return render(request,'static/imageview.html',{'no':pk,'url':image.file_name.url})

#def img(request,pk):
#	image = Files.objects.get(pk=pk)
#	display = "<p><img src='{url}'/></p>".format(url=image.file_name.url)
#	return HttpResponse(display)

