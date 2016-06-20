#!/bin/bash

CURRENT_PATH=$(pwd)

LOGFOLDER=$CURRENT_PATH"/logs/"
PIDFOLDER=$CURRENT_PATH"/pid/"

#PID file where the this script process ID is stored
WATCHDOGPIDFILE=$PIDFOLDER"watchdog-admin.pid"
#PID file where the node process ID is stored
NODEPIDFILE=$PIDFOLDER"node-admin.pid"
#Watchdog process error log file
WATCHDOGLOGFILE=$LOGFOLDER"admin-watchdog-error.log"
#Node process error log file
NODELOGFILE=$LOGFOLDER"admin-error.log"
#Command to be executed on daemon start
COMMAND="NODE_ENV=production node signaller.js 1 > /dev/null 2>> $NODELOGFILE"

ARG_1=$1

start() {
    if [ -e $NODEPIDFILE ]; then
        PID=$(cat $NODEPIDFILE)
        if [ $(ps -o pid | grep $PID) ]; then
            return;
        else
            touch $NODEPIDFILE
            nohup $COMMAND &
            echo $! > $NODEPIDFILE
        fi
    else
        touch $NODEPIDFILE
        nohup $COMMAND &
        echo $! > $NODEPIDFILE
    fi
}

stop() {
    if [ -e $NODEPIDFILE ]; then
        PID=$(cat $NODEPIDFILE)
        if [ $(ps -o pid | grep $PID) ]; then
            kill -9 $PID
        fi
        rm $NODEPIDFILE
    fi
}

stopdaemon() {
    stop
    rm $WATCHDOGPIDFILE
    exit 0
}

log() {
    echo $1 >> $WATCHDOGLOGFILE
}

keep_alive() {
    if [ -e $NODEPIDFILE ]; then
        PID=$(cat $NODEPIDFILE)
        if [ $(ps -o pid | grep $PID) ]; then
            return;
        else
            log "Jim, he is dead!! Trying ressurection spell..."
            start
        fi
    else
        start
    fi
}

case x${ARG_1} in
    x-start )

        echo "Starting daemon watchdog"
        nohup "$0" -daemon &> /dev/null &

    ;;

    x-daemon )

        if [ -e $WATCHDOGPIDFILE ]; then
            PID=$(cat $WATCHDOGPIDFILE)
            if [ $(ps -o pid | grep $PID) ]; then
                exit 0;
            fi
        fi

        touch $WATCHDOGPIDFILE

        echo $$ > $WATCHDOGPIDFILE

        #trap the interruption or kill signal
        trap stopdaemon INT SIGINT TERM SIGTERM

        start

        while true; do
            keep_alive
            wait
            sleep 1
        done

    ;;

    x-stop )

        echo "Stopping daemon watchdog"
        PID=$(cat $WATCHDOGPIDFILE)
        kill $PID

    ;;

    x-status )
        #check if process is running and PID file exists, and report it back
    ;;
    x )
        echo "Usage {start|stop|status}"
esac

exit 0
