from django.db import models

class Blog(models.Model):
	bl_no = models.AutoField(unique=True,primary_key=True)
	bl_title = models.CharField(max_length=255)
	bl_content = models.TextField()
	bl_user = models.CharField(max_length=255)
	bl_date = models.DateTimeField(auto_now_add=True)

class Files(models.Model):
	file_no = models.AutoField(unique=True,primary_key=True)
	file_name = models.ImageField(upload_to='%y/%m/%d',max_length=500)
	bl_no = models.ForeignKey(Blog)