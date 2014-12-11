#!/bin/bash
#------------------------------------------------
# start-fresh.sh
#
# Simple utility to clean out unnecessary stuff
# before packaging this directory
#
#------------------------------------------------
# @author: Raj Sesetti, AT&T DRT/LSA
#------------------------------------------------

# Add items to this variable if needed
#
LIST_TO_CLEAN="node_modules logs cache virtual_numbers.json users.json *.log"

clear
echo "---------------------"
echo "Starting fresh..."
echo "---------------------"
echo

# DON'T edit after this line
#
function start-fresh {
	[[ $1 ]] && {
		echo "Cleaning out: $1"
		rm -rf $1
	}
}

for i in $LIST_TO_CLEAN
do
	start-fresh $i
done

echo "---------------------"
echo "DONE"
echo "---------------------"
echo "Hints: Now that you are starting fresh..."
echo "Run 'npm install': to re-install Sample App node dependencies"
echo "Then, run 'npm start': to start Sample App"
echo

#------------------------------------------------
# END: start-fresh.sh
#------------------------------------------------

