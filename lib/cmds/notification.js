/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

'use strict'

// -- Requires -------------------------------------------------------------------------------------

var async = require('async'),
    base = require('../base'),
    logger = require('../logger'),
    printed = {}

// -- Constructor ----------------------------------------------------------------------------------

function Notifications(options) {
    this.options = options

    if (!options.repo) {
        logger.error('You must specify a Git repository with a GitHub remote to run this command')
    }
}

// -- Constants ------------------------------------------------------------------------------------

Notifications.DETAILS = {
    alias: 'nt',
    description: 'Provides a set of util commands to work with Notifications.',
    commands: ['latest', 'watch'],
    options: {
        latest: Boolean,
        remote: String,
        repo: String,
        user: String,
        watch: Boolean,
        only_new: Boolean,
    },
    shorthands: {
        l: ['--latest'],
        r: ['--repo'],
        u: ['--user'],
        w: ['--watch'],
        n: ['--only-new'],
    },
    payload: function(payload, options) {
        options.latest = true
    },
}

// -- Commands -------------------------------------------------------------------------------------

Notifications.prototype.run = function(done) {
    var instance = this,
        options = instance.options

    options.only_new = options["only-new"];

    if (options.latest) {
        logger.log(
            'Listing activities on ' + logger.colors.green(options.user + '/' + options.repo)
        )
        instance.latest(false, false, done)
    }

    if (options.watch) {
        logger.log(
            'Watching any activity on ' + logger.colors.green(options.user + '/' + options.repo)
        )
        instance.watch(options.only_new)
    }
}

Notifications.prototype.latest = function(opt_watch, only_new, done) {
    var instance = this,
        options = instance.options,
        operations,
        payload,
        listEvents,
        filteredListEvents = []

    operations = [
        function(callback) {
            payload = {
                user: options.user,
                repo: options.repo,
            }

            base.github.events.getFromRepo(payload, function(err, data) {
                if (!err) {
                    listEvents = data
                }
                callback(err)
            })
        },
        function(callback) {
            listEvents.forEach(function(event) {
                event.txt = instance.getMessage_(event)

                if (opt_watch) {
                    if (!printed[event.created_at]) {
                        //console.log(event.created_at, new Date())
                        filteredListEvents.push(event)
                    }
                } else {
                    var now = new Date();
                    now.setMinutes(now.getMinutes() - 5);

                    if (!only_new || now < new Date(event.created_at)) {
                        filteredListEvents.push(event)
                    }
                }

                printed[event.created_at] = true
            })
            callback()
        },
    ]

    async.series(operations, function(err) {
        if (err) {
            throw new Error(`Can't get latest notifications.\n${err}`)
        }

        if (filteredListEvents.length) {
            if (!options.watch) {
                logger.log(logger.colors.yellow(options.user + '/' + options.repo))
            }

            filteredListEvents
                .sort(function(ev1, ev2) {
                    return new Date(ev1.created_at) > new Date(ev2.created_at)? 1: -1;
                })
                .forEach(function(event) {
                    logger.log(
                        logger.colors.yellow(logger.getDate(event.created_at, "HH:mm:ss")) +
                        ' ' +
                        logger.colors.magenta('@' + event.actor.login) +
                        ' ' +
                        event.txt
                    )
            })
        }

        done && done()
    })
}

Notifications.prototype.watch = function(only_new) {
    var instance = this,
        intervalTime = 3000

    instance.latest(false, only_new)

    setInterval(function() {
        instance.latest(true, only_new)
    }, intervalTime)
}

function commitsMessage(commits) {
    return commits.reduce(function(acc, commit) {
        var title = logger.colors.white(commit.message.split('\n')[0]),
            sha = logger.colors.cyan(commit.sha.substring(0, 8))
        return (acc += '\t' + title + ' ' + sha + '\n')
    }, "")
}

Notifications.prototype.getMessage_ = function(event) {
    var txt = '',
        type = event.type,
        payload = event.payload

    switch (type) {
        case 'CommitCommentEvent':
            txt = 'commented on a commit'
            break
        case 'CreateEvent':
            txt = 'created ' + payload.ref_type + ' ' + logger.colors.green(payload.ref)
            break
        case 'DeleteEvent':
            txt = 'removed ' + payload.ref_type + ' ' + logger.colors.green(payload.ref)
            break
        case 'ForkEvent':
            txt = 'forked'
            break
        case 'GollumEvent':
            txt =
                payload.pages[0].action +
                ' the ' +
                logger.colors.green(payload.pages[0].page_name) +
                ' wiki page at'
            break
        case 'IssueCommentEvent':
            txt = 'commented on issue ' + logger.colors.green('#' + payload.issue.number)
            break
        case 'IssuesEvent':
            txt =
                payload.action + ' issue ' + logger.colors.green('#' + payload.issue.number)
            break
        case 'MemberEvent':
            txt =
                'added ' + logger.colors.green('@' + payload.member.login) + ' as a collaborator'
            break
        case 'PageBuildEvent':
            txt = 'builded a GitHub Page'
            break
        case 'PublicEvent':
            txt = 'open sourced'
            break
        case 'PullRequestEvent':
            txt =
                payload.action +
                ' pull request ' +
                logger.colors.green('#' + payload.number)
            break
        case 'PullRequestReviewCommentEvent':
            txt =
                'commented on pull request ' +
                logger.colors.green('#' + payload.pull_request.number) +
                ' at'
            break
        case 'PushEvent':
            txt = 'pushed ' + logger.colors.green(payload.size) + ' commit(s)\n' + commitsMessage(payload.commits)
            break
        case 'ReleaseEvent':
            txt = 'released ' + logger.colors.green(payload.release.tag_name)
            break
        case 'StatusEvent':
            txt = 'changed the status of a commit'
            break
        case 'WatchEvent':
            txt = 'starred'
            break
        default:
            logger.error('event type not found: ' + logger.colors.red(type))
            break
    }

    return txt
}

exports.Impl = Notifications
