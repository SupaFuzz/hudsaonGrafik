<?php

#function for rendering csv tables
	function csv_table($id,$file) {

		echo '<table id="' . $id . '" class="_list zebra">';

		$row = 1;
		if (($handle = fopen($file, "r")) !== FALSE) {
			while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
				$num = count($data);

				#tag first row as a header
				if ($row == 1){
					echo '<tr class="header">';
				}else{
					echo '<tr>';
				}

				#spew every field as a column
				for ($c=0; $c < $num; $c++) {

					#if this is the first column, we'll set a link
					#and some inline content
					if ($c == 0 and $row != 1){

						#the first column link and inline content
						echo '<td>';
						echo '<a class="fblink" href="#' . $id . $row . '_data">' . htmlentities($data[$c]) . '</a>';
						echo '<div style="display:none" id="content">';
						echo '<div id="' . $id . $row . '_data" class="_detail">';

							#content

							#the picture. if the csv-specified pic file exists use it
							#otherwise use the default
							if (
								(! is_null($data[$c+4])) AND
								(file_exists('./grfx/inventory_pics/' . $data[$c+4]))
							){
								echo '<img src="/grfx/inventory_pics/'. $data[$c+4] . '" alt="picture of ' . htmlentities($data[$c]) . '" />';
							}else{
								echo '<img src="/grfx/logo8.gif" alt="picture not available" />';
								echo '<br /><i>picture not available</i>';
							}

							#the rest
							echo '<h1>' . htmlentities($data[$c]) . '</h1>';
							echo '<p><strong>disposition: </strong>' . htmlentities($data[$c+1]) . '<br />';
							echo '<strong>price: </strong>' . htmlentities($data[$c+2]) . '<br />';
							echo '<strong>in stock: </strong>' . htmlentities($data[$c+3]) . '</p>';
							echo '<div id="ordering">';
							echo '<i><strong>ordering info:</strong></i>';
							echo 'call Karl @<br />';
							echo '<ul><li>European Tel.: +49-178-470-1991 (WhatsApp)</li>';
							echo '<li>U.S. Tel.: +1-678-208-5844 (voice &amp; text)</li></ul></div>';

						echo '</div></div>';
						echo '</td>';

					#if this is the fifth column, it's the "picture file" column
					#we just want to skip it
					}elseif ($c == 4){
						next
						;
					#if this is just one of the other columns, spew it
					}else{
						#just a regular column
						echo '<td>' . htmlentities($data[$c]) . '</td>';
					}
				}

				echo '</tr>';
				$row ++;
			}
			fclose($handle);
		}

		echo '</table>';
	}


	#get which content to show
	$p = "main";
	if (isset($_GET['p'])) {
		$p = (get_magic_quotes_gpc()) ? $_GET['p'] : addslashes($_GET['p']);
	}

	$myDir = "/";

	#enumerated documents == security
	$doc = "main.shtml";

	if ($p == "main"){
		$doc = "main.shtml";
	}

	if ($p == "about"){
		$doc = "about.shtml";
	}

	if ($p == "equip"){
		$doc = "equipment.shtml";
	}

	if ($p == "euro"){
		$doc = "euro.shtml";
	}

	if ($p == "contact"){
		$doc = "contact.shtml";
	}

	if ($p == "partners"){
		$doc = "partners.shtml";
	}

	if ($p == "diodes"){
		$doc = "diodes.shtml";
	}

	#document type definition
	echo "<?xml version=\"1.0\" encoding=\"iso-8859-1\"?".">";
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title>Hudson Grafik Service: primescan, tango, heidelberg, linotype-hell, drum scanner, film scanner, analog photography</title>

<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<meta name="KEYWORDS" content="primescan, tango, heidelberg, linotype-hell, drum scanner, film scanner, analog photography" />
<meta name="DESCRIPTION" content="sales, maintenance and repair of prepress equipment manufactured in Kiel, Germany" />


<link href="hudson.css" rel="stylesheet" type="text/css" media="screen" />
<link href="/javascript/fancybox/jquery.fancybox-1.3.1.css" rel="stylesheet"  type="text/css" media="screen" />

<script src="/javascript/jquery.js" type="text/javascript"></script>
<script src="/javascript/aqFloater-mod.js" type="text/javascript"></script>
<script type="text/javascript" src="javascript/fancybox/jquery.fancybox-1.3.1.pack.js"></script>

<script type="text/javascript">
$(document).ready(function(){

	// set up the badge
	if (jQuery.support.boxModel){
		$('#badge').hover(
			function(){ $(this).css('opacity',1) },
			function(){ $(this).css('opacity',.9) }
		).aqFloater({attach: 'n', duration: 300, opacity: .9, offsetX:65, offsetY:15});
	}else{
		$('#badge').aqFloater({attach: 'nw', duration: 300, offsetX:150, offsetY:15});
	}

	$('#badge').removeClass('hidem');
	if ($.browser.msie) {
		$('#badge').addClass('badge_msie');
		$('#content h1').css("font-size","1.8em");
		$('#title h1').css("font-size","2.3em");

	}else{
		$('#badge').addClass('badge_moz');
	}

	// zebra stripe the equipment list
	$('.zebra tr:odd').addClass('high');

	//highlight the row
	$('.zebra tr').hover(
		function(){ if (! ($(this).hasClass('header'))){ $(this).addClass('hovered');} },
	        function(){ if (! ($(this).hasClass('header'))){$(this).removeClass('hovered');} }
	);

	//fancybox stuffs
	$("a.fblink").fancybox({
		'transitionIn'	:	'elastic',
		'transitionOut'	:	'elastic',
		'speedIn'	:	600,
		'speedOut'	:	200,
		'overlayShow'	:	true,
		'overlayOpacity':	.5
	});




 });
</script>

</head>
<body>

<!-- google analytics hook -->
<script type="text/javascript">

  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-78017-4']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();

</script>

<div id="centerwrap">

	<!--
	<div id="badge" class="hidem"><a href="<?php echo $myDir;?>?p=diodes" title="diodes">Refurbished Laser Diodes</a></div>
	-->
	<div id="header">
		<!-- address -->
		<div id="address">
			<h1>Hudson Grafik Service, Inc.</h1>
				<p>Atlanta, GA. USA<br/>
				&nbsp;<br />
				(678) 208-5844
				</p>
		</div>


		<!-- content -->
		<?php include($doc); ?>

	<div id="footer"></div>

	<div id="footer_menu">
		<!--
		<ul>
			<li id="email"><a href="http://mail.google.com/a/hudsongrafik.com">Web Mail</a></li>
			<li id="hicox"><a href="http://hicox.com">Hicox Design</a></li>
			<li id="css"><a href="http://jigsaw.w3.org/css-validator/">CSS</a></li>
			<li id="xhtml"><a href="http://validator.w3.org/check?uri=referer">XHTML</a></li>
		</ul>
		-->
		&nbsp;
	</div>

</div>

</body>
</html>
