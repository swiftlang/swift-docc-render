#!/usr/bin/env python

"""
 This source file is part of the Swift.org open source project

 Copyright (c) 2021 Apple Inc. and the Swift project authors
 Licensed under Apache License v2.0 with Runtime Library Exception

 See https://swift.org/LICENSE.txt for license information
 See https://swift.org/CONTRIBUTORS.txt for Swift project authors
 ------------------------------------------------------------------------------
 This is a helper script for the main swift repository's build-script.py that
 knows how to build and install the swift-docc-render.
"""

from __future__ import print_function

import argparse
import os
import platform
import subprocess
import sys
import tempfile


# -----------------------------------------------------------------------------
# Constants

PROJECT_ROOT_DIR = os.path.dirname(os.path.realpath(__file__))
BUILT_TEMPLATE_DIR = os.path.join(PROJECT_ROOT_DIR, "dist")


# -----------------------------------------------------------------------------
# Helpers

def printerr(message):
    print(message, file=sys.stderr)

def note(message):
    print("--- %s: note: %s" % (os.path.basename(sys.argv[0]), message))
    sys.stdout.flush()

def fatal_error(message):
    printerr(message)
    sys.exit(1)

def escapeCmdArg(arg):
    if '"' in arg or " " in arg:
        return '"%s"' % arg.replace('"', '\\"')
    else:
        return arg

def check_call(cmd, cwd=None, env=os.environ, verbose=False):
    if verbose:
        print(" ".join([escapeCmdArg(arg) for arg in cmd]))
    return subprocess.check_call(cmd, cwd=cwd, env=env, stderr=subprocess.STDOUT)

def check_output(cmd, cwd=None, env=os.environ, verbose=False):
    if verbose:
        print(" ".join([escapeCmdArg(arg) for arg in cmd]))
    return subprocess.check_output(cmd, cwd=cwd, env=env, stderr=subprocess.STDOUT)


# -----------------------------------------------------------------------------
# Building, Testing, and Installing Swift-DocC-Render

def ensure_npm_is_installed(verbose=False):
    cmd = 'where' if platform.system() == 'Windows' else 'which'
    try:
        check_output([cmd, 'npm'], verbose=verbose)
        check_output([cmd, 'node'], verbose=verbose)
    except:
        error_msg = "Could not locate 'npm'. Swift-DocC-Render requires node. "\
            "See the README.md file for more information about building Swift-DocC-Render."
        fatal_error('-- Error: %s' % error_msg)
    try:
        node_version = check_output(['node', '--version'], verbose=verbose)
        if not node_version.startswith('v14.17.'):
            warn_msg = "Unexpected version of 'node' installed. Swift-DocC-Render requires node 14.17.4. "\
                "See the README.md file for more information about building Swift-DocC-Render."
            printerr('-- Warning: %s' % warn_msg)
    except:
        error_msg = "Could not check 'node' version. Swift-DocC-Render requires node. "\
            "See the README.md file for more information about building Swift-DocC-Render."
        fatal_error('-- Error: %s' % error_msg)


def run(action, verbose=False):
    ensure_npm_is_installed(verbose)
    
    check_call(['npm', 'ci'], cwd=PROJECT_ROOT_DIR, verbose=verbose)
    check_call(['npm', 'run', action], cwd=PROJECT_ROOT_DIR, verbose=verbose) # action should be either 'build' or 'test'


def check_and_sync(file_path, install_path):
    cmd = ["mkdir", "-p", install_path]
    note("creating target directory %s: %s" % (install_path, " ".join(cmd)))
    result = subprocess.check_call(cmd, cwd=PROJECT_ROOT_DIR)
    if result != 0:
        fatal_error("install failed with exit status %d" % (result,))
    cmd = ["rsync", "-a", file_path, install_path]
    note("installing %s: %s" % (os.path.basename(file_path), " ".join(cmd)))
    result = subprocess.check_call(cmd, cwd=PROJECT_ROOT_DIR)
    if result != 0:
        fatal_error("install failed with exit status %d" % (result,))


def install(build_dir, install_dir):
    # Copy the content of the build_dir into the install dir with a call like
    # rsync -a src/ dest

    build_dir_with_trailing_slash = os.path.join(build_dir, '')
    check_and_sync(
        file_path=build_dir_with_trailing_slash,
        install_path=install_dir
    )


# -----------------------------------------------------------------------------
# Argument Parsing

_DESCRIPTION = """
Build and test script for Swift-DocC-Render.

To build Swift-DocC and Swift-DocC alongside Swift itself, Swift-DocC-Render needs
to be checked out alongside Swift-DocC (https://github.com/apple/swift-docc/) and the
main Swift repo (https://github.com/apple/swift/) in the following structure:

- (containing directory)
  - swift
  - swift-docc
  - swift-docc-render

"""


def parse_args():
    parser = argparse.ArgumentParser(
        formatter_class=argparse.RawDescriptionHelpFormatter, description=_DESCRIPTION
    )
    
    parser.add_argument('build_action', help='Extra actions to perform. Can be any number of the following', choices=['build', 'test', 'install'])

    parser.add_argument(
        "-v", "--verbose", action="store_true", help="Enable verbose logging."
    )
    
    parser.add_argument(
        "--install-dir",
        help="The directory to where the built template content should be installed.",
        default=None
    )

    return parser.parse_args()
    

# -----------------------------------------------------------------------------


def main():
    args = parse_args()

    subcommand = args.build_action
    if subcommand == 'install':
        if args.install_dir is None:
            fatal_error("Missing required '--install-dir' argument.")
        install(
            build_dir=BUILT_TEMPLATE_DIR,
            install_dir=args.install_dir
        )
    else:
        if args.install_dir is not None:
            fatal_error("Unexpected '--install-dir' argument for '%s' command." % subcommand)
        run(action=subcommand, verbose=args.verbose)

if __name__ == "__main__":
    main()
