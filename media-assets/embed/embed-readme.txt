The code included in embed-code.html is all you will need to embed a graphic.  Open that file, copy the code and paste it into your html document.

The embed code consists of three lines of code.

1. The first line is a link to a hosted script file.  The code will generate a frame on your page for the interactive.  If you do not want to link to our servers for this script file, you can upload the enclosed pym.js file to your own server, and link to that instead.

<script type="text/javascript" src="//graphics.thomsonreuters.com/pym.min.js"></script>


2. The second line is an html element (div) with a unique ID.  This ID will also appear in the script tag in the third line. You are free to change the ID of this div.  However, you must also change the id referenced in the third line of code. The graphic is built to take up the entire width of whatever html element contains it.  So if you would like the graphic to be smaller or larger, simply size the container element. 

<div id="targetdiv"></div>


3. The third line of code is script tag used to create the responsive iframe for the graphic.  This tag requires two specific pieces of text: the unique ID of the div created in line two, and a link to the hosted graphic.  
If you would rather host the graphic yourself, place the production files of the graphic on your server, and change this link to point to your hosted version.

<script>
    var pymParent = new pym.Parent('targetdiv', '{{ page_url }}index.html', {});
</script>