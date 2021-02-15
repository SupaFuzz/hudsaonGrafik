#!/usr/bin/perl

use strict;
use warnings;


print "Content-type: text/html\n\n";
print "<h1>", time(), "</h1>\n";
print "<h2>version: " . $ENV{MOD_PERL} . "</h2>\n";
print "<div class='data'>\n";

foreach my $d (@INC){
  print "<h3>" . $d . "</h3>\n";
}

print "</div>"
