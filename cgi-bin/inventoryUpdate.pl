#!/usr/bin/perl

use strict;
use warnings;
use CGI;

my $q = CGI->new;
#my $data = $p->param('POSTDATA');


print "Content-type: text/html\n\n";
print "<h1>", time(), "</h1>\n";
print "<h2>version: " . $ENV{MOD_PERL} . "</h2>\n";
print "<div class='data'>\n";

#my @names = $q->param;
#foreach my $name (@names){
#    print "<strong>" . $name . ": </strong><span>" . $q->param($name) . "</span><br>\n";
#}

## this, unfortunately is merely the filename
$q->param('inventoryCSVFile');

## this does not work
#print $q->upload('inventoryCSVFile') . "\n";
open (IN, $q->upload('inventoryCSVFile'));
my $g = join('', <IN>);
close(IN);
print $g . "\n";

## none of this shit works. We're gonna have to go mod_perl and I'm not even feeling that.
## at the same time ... god please no proxies to an express server. That's way too far!
## this should work. It ran the entirety of the internet for like 20 years!
## but still yeah mod_perl is probably where it's at

#print $q->upload('inventoryCSVFile') . "\n";

# ok y'know what, this is a pain in the arse
# thinking I'm just gonna go full REST and take
# a single JSON object
# oh god. oh wait. this is perl. no json.

# I really hate to have to install node and 6GB of node_modules for this
# ... buhgoddayum ...
# perl is great. CPAN sucks the donkeynut


#if ( my $io_handle = $q->upload('inventoryCSVFile') ) {
#    my $buffer;
#    while ( my $bytesread = $io_handle->read($buffer,1024) ) {
#        print "<pre>" . $buffer . "</pre>";
#    }
#}

print "</div>"
