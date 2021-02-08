#!/usr/bin/perl

use strict;
use warnings;
use CGI;

my $p = CGI->new;
my $data = $p->param('POSTDATA');


print "Content-type: text/html\n\n";
print "<h1>", time(), "</h1>\n";
