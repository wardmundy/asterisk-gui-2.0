/*
 * Asterisk-GUI	- an Asterisk configuration interface
 *
 * Core objects and utilities for their configs
 *
 * Copyright (C) 2006-2008, Digium, Inc.
 *
 * Ryan Brindley <ryan@digium.com>
 *
 * See http://www.asterisk.org for more information about
 * the Asterisk project. Please do not directly contact
 * any of the maintainers of this project for assistance;
 * the project provides a web site, mailing lists and IRC
 * channels for your use.
 *
 * This program is free software, distributed under the terms of
 * the GNU General Public License Version 2. See the LICENSE file
 * at the top of the source tree.
 *
 */

/**
 * The main config class.
 * This class contains all the objects of Asterisk that can be configured by the GUI.
 */
var pbx = {};

/**
 * Incoming Calling Rules object.
 */
pbx.calling_rules_inc = {};

/**
 * Outgoing Calling Rules object.
 */
pbx.calling_rules_out = {};

/**
 * Conferences object.
 */
pbx.conferences = {};

/**
 * Dial Plans object.
 */
pbx.dial_plans = {};

/**
 * Directory object.
 */
pbx.directory = {};

/**
 * Features object.
 */
pbx.features = {};

/**
 * Hardware object.
 */
pbx.hardware = {};

/**
 * Music On Hold object.
 */
pbx.moh = {};

/**
 * Paging object.
 */
pbx.paging = {};

/**
 * Queues object.
 */
pbx.queues = {};

/**
 * Ring Groups object.
 */
pbx.ring_groups = {};

/**
 * Time Interval object.
 */
pbx.time_intervals = {};

/**
 * Trunks object.
 */
pbx.trunks = {};

/**
 * Users object.
 */
pbx.users = {};

/**
 * VoiceMail Groups object.
 */
pbx.vm_groups = {};

/**
 * Voicemail object.
 */
pbx.voicemail = {};

/**
 * Voice Menus object.
 */
pbx.voice_menus = {};
