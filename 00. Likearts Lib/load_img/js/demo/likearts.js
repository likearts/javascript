/*
 * JavaScript Load Image Demo JS
 * https://github.com/blueimp/JavaScript-Load-Image
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 */

/* global loadImage, HTMLCanvasElement, $ */

$(function () {
  'use strict'
  
  var result = $('#result');
  var currentFile;

  function dropChangeHandler (e) {
    e.preventDefault()
    e = e.originalEvent
    var target = e.dataTransfer || e.target
    var file = target && target.files && target.files[0]
    var options = {
      maxWidth: result.width(),
      canvas: true,
      pixelRatio: window.devicePixelRatio,
      downsamplingRatio: 0.5,
      orientation: true
    }
    if (!file) return
    displayImage(file, options)
}
  
 function displayImage (file, options) {
    currentFile = file
    if (!loadImage(
        file,
        updateResults,
        options )) 
    {
          result.children().replaceWith(
            $('<span>' +
              'Your browser does not support the URL or FileReader API.' +
              '</span>')
          )
    }
  }

  function updateResults ( img, data ) {
    //console.log( img, data);
    var orientation = data.exif.get('Orientation');
    console.log( 'orientation', orientation );
    if (!(img.src || img instanceof HTMLCanvasElement)) {
        result.html('<span>Loading image file failed</span>');
        return;
    }
    var content = $('<a target="_blank">').append(img)
        .attr('download', currentFile.name)
        .attr('href', img.src || img.toDataURL());
    result.children().replaceWith(content);
  }

  $('#file-input')
    .on('change', dropChangeHandler)

})
