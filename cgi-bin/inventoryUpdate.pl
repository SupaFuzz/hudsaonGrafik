#!/usr/bin/perl

use strict;
use warnings;
use CGI;

my $q = CGI->new;
#my $data = $p->param('POSTDATA');


print "Content-type: text/html\n\n";
print "<h1>", time(), "</h1>\n";
print "<div class='data'>\n";

if ( my $io_handle = $q->upload('inventoryCSVCFile') ) {
    my $buffer;
    while ( my $bytesread = $io_handle->read($buffer,1024) ) {
        print "<pre>" . $buffer . "</pre>";
    }
}

print "</div>"
