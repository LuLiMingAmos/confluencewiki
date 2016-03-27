/*!
 * jQuery Floating Scrollbar - v0.4 - 02/28/2011
 * http://benalman.com/
 *
 * Copyright (c) 2011 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function(d){var i=d(this),e=d("html"),a=d([]),j,f,g=d('<div id="floating-scrollbar"><div/></div>'),b=g.children();g.hide().css({position:"fixed",bottom:0,height:"30px",overflowX:"auto",overflowY:"hidden"}).scroll(function(){j&&j.scrollLeft(g.scrollLeft())});b.css({border:"1px solid #fff",opacity:0.01});d.fn.floatingScrollbar=function(l){if(l===false){a=a.not(this);this.unbind("scroll",k);if(!a.length){g.detach();i.unbind("resize scroll",c)}}else{if(this.length){if(!a.length){i.resize(c).scroll(c)}a=a.add(this)}}c();return this};d.floatingScrollbarUpdate=c;function h(l){g.toggle(!!l)}function k(){j&&g.scrollLeft(j.scrollLeft())}function c(){f=j;j=null;a.each(function(){var s=d(this),t=s.offset().top,p=t+s.height(),r=i.scrollTop()+i.height(),q=30;if(t+q<r&&p>r){j=s;return false}});if(!j){h();return}var m=j.scrollLeft(),l=j.scrollLeft(90019001).scrollLeft(),o=j.innerWidth(),n=o+l;j.scrollLeft(m);if(n<=o){h();return}h(true);if(!f||f[0]!==j[0]){f&&f.unbind("scroll",k);j.scroll(k).after(g)}g.css({left:j.offset().left-i.scrollLeft(),width:o}).scrollLeft(m);b.width(n)}})(jQuery);