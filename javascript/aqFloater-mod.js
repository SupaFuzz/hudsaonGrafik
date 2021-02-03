/* aqFloater v1.1 - Floats an element that attaches itself to a part of the browser window.
   Copyright (C) 2009 paul pham <http://aquaron.com/~jquery/aqFloater>

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
(function($){
   $.fn.aqFloater = function($o) {
      var _opts = $.extend({
         offsetX: 0, offsetY: 0, attach: '', duration: 50, opacity: '.9'
      }, $o);

      var $obj = this;
      $obj.css({ position: 'absolute', opacity: _opts.opacity });

      var _show = function() {
         var _de = document.documentElement;

         var _y = (_opts.attach.match(/n/) ? 0 
            : (_opts.attach.match(/s/) 
               ? (_de.clientHeight - $obj.outerHeight()-10)
               : Math.round((_de.clientHeight-$obj.height())/2)));

         var _x = (_opts.attach.match(/w/) ? 0
            : (_opts.attach.match(/e/)
               ? (_de.clientWidth - $obj.outerWidth()-10)
               : Math.round((_de.clientWidth-$obj.width())/2)));
     
         
         /* mod to keep the badge from following the vertical scroll */
         /* this ain't geocities */
         var _shabidoo = $(document).scrollTop();
         if (_opts.attach.match(/n/)){ _shabidoo = 0; }
         
         $obj.animate({
            top:  (_y + _shabidoo + _opts.offsetY) + 'px',
            left: (_x + $(document).scrollLeft() + _opts.offsetX) + 'px'
         },{queue:false, duration:_opts.duration});
      };

      /* why would anyone want this? */
      //$(window).scroll(_show).resize(_show);
      //$(window).trigger('scroll');
      
      $(window).resize(_show);
      $(window).trigger('resize');
   };
})(jQuery);
