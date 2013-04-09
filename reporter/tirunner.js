$(function() {
	
	$('a.btn-showall').click(function(evt) {
		
		var that = $(this);
		
		if (that.parent().hasClass('hide-messages')) {
			that.parent().removeClass('hide-messages');
			that.html('HIDE');
		} else {
			that.parent().addClass('hide-messages');
			that.html('SHOW');			
		}
				
		return false;
		});
	
	// remove last hide
	$('div.suite:last').removeClass('hide-messages');
	$('div.suite:last a.btn-showall').html('HIDE');
	
});