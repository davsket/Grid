(function(){
	var grid = $$('.grid');
	for(i=0 ;i<70; i++){
		grid.grab(new Element('div.elem',{html: i}));
	}
	var test = new Grid();
})()