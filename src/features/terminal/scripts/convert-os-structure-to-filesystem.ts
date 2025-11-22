import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Lade Scripts-Konfiguration
import scriptsConfig from '../../shared/scripts/config.js';

interface FileNode {
  type: 'file' | 'directory';
  permissions: string;
  owner: string;
  group: string;
  size: number;
  modified: string;
  content?: string;
  contents?: Record<string, FileNode>;
}

interface FilesystemStructure {
  filesystem: Record<string, FileNode>;
  currentPath: string;
  systemInfo: {
    username: string;
    hostname: string;
    platform: string;
    arch: string;
    release: string;
  };
  permissions: Record<string, {
    read: string[];
    write: string[];
    execute: string[];
  }>;
}

function convertOsStructureToFilesystem(): void {
  console.log('🔄 Converting OS structure to filesystem format...');
  
  // Hole echte System-Informationen
  const systemUser = os.userInfo().username;
  const systemHostname = os.hostname();
  
  console.log(`👤 Using system user: ${systemUser}`);
  console.log(`🖥️  Using system hostname: ${systemHostname}`);
  
  // Load the fake-os-structure.json (das von copy-fake-os-structure.js erstellt wurde)
  const osStructurePath = path.join(__dirname, '../../frontend/public/data/fake-os-structure.json');
  const osStructure = JSON.parse(fs.readFileSync(osStructurePath, 'utf8'));
  
  // Filter out portfolio-related files that shouldn't be in the terminal
  const portfolioFiles = scriptsConfig.terminal.filesystem.excludePortfolioFiles;
  
  // Convert the structure to the filesystem format using REAL system data
  const filesystem = {
    filesystem: {},
    currentPath: `/home/${systemUser}`,
    systemInfo: {
      username: systemUser,
      hostname: systemHostname,
      platform: os.platform(),
      arch: os.arch(),
      release: os.release()
    },
    permissions: {
      [systemUser]: {
        read: [`/home/${systemUser}`, '/usr', '/var/log', '/tmp'],
        write: [`/home/${systemUser}`, '/tmp'],
        execute: [`/home/${systemUser}`, '/usr/bin', '/usr/local/bin', '/tmp']
      },
      'root': {
        read: ['/'],
        write: ['/'],
        execute: ['/']
      }
    }
  };
  
  // Convert the filesystem structure
  function convertNode(nodePath: string, node: any, parentPath: string = ''): FileNode | null {
    const fullPath = parentPath ? `${parentPath}/${nodePath}` : `/${nodePath}`;
    
    // Skip portfolio files that shouldn't be in the terminal
    if (portfolioFiles.includes(nodePath)) {
      return null;
    }
    
    if (typeof node === 'string' && node === 'file') {
      // It's a file
      return {
        type: 'file',
        permissions: '-rw-r--r--',
        owner: fullPath.startsWith(`/home/${systemUser}`) ? systemUser : 'root',
        group: fullPath.startsWith(`/home/${systemUser}`) ? systemUser : 'root',
        size: Math.floor(Math.random() * (scriptsConfig.terminal.filesystem.fileSizeRange.max - scriptsConfig.terminal.filesystem.fileSizeRange.min)) + scriptsConfig.terminal.filesystem.fileSizeRange.min,
        modified: new Date().toISOString(),
        content: generateFileContent(nodePath, fullPath)
      };
    } else if (typeof node === 'object' && node !== null) {
      // It's a directory
      const contents: { [key: string]: any } = {};
      
      // Process all children, but filter out portfolio files
      for (const [childName, childNode] of Object.entries(node)) {
        if (!portfolioFiles.includes(childName)) {
          const convertedChild = convertNode(childName, childNode, fullPath);
          if (convertedChild) {
            contents[childName] = convertedChild;
          }
        }
      }
      
      // Only create directory if it has contents
      if (Object.keys(contents).length > 0) {
        return {
          type: 'directory',
          permissions: 'drwxr-xr-x',
          owner: fullPath.startsWith(`/home/${systemUser}`) ? systemUser : 'root',
          group: fullPath.startsWith(`/home/${systemUser}`) ? systemUser : 'root',
          size: scriptsConfig.terminal.filesystem.directorySize,
          modified: new Date().toISOString(),
          contents: contents
        };
      }
    }
    
    return null;
  }
  
  // Generate realistic file content based on file name and path
  function generateFileContent(fileName: string, fullPath: string): string {
    const ext = path.extname(fileName).toLowerCase();
    const baseName = path.basename(fileName, ext);
    
    // Special files
    if (fileName === '.bashrc') {
      return `# ~/.bashrc: executed by bash(1) for non-login shells.

# If not running interactively, don't do anything
case $- in
    *i*) ;;
      *) return;;
esac

# History settings
HISTCONTROL=ignoreboth
HISTSIZE=1000
HISTFILESIZE=2000

# Append to the history file, don't overwrite it
shopt -s histappend

# Check the window size after each command
shopt -s checkwinsize

# Set a fancy prompt
PS1='\\u@\\h:\\w\\$ '

# Enable color support
if [ -x /usr/bin/dircolors ]; then
    test -r ~/.dircolors && eval "\$(dircolors -b ~/.dircolors)" || eval "\$(dircolors -b)"
    alias ls='ls --color=auto'
    alias grep='grep --color=auto'
    alias fgrep='fgrep --color=auto'
    alias egrep='egrep --color=auto'
fi

# Some more ls aliases
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'

# Add an "alert" alias for long running commands
alias alert='notify-send --urgency=low -i "\$([ \$? = 0 ] && echo terminal || echo error)" "\$(history|tail -n1|sed -e '\\''s/^\\s*[0-9]\\+\\s*//;s/[;&|]\\s*alert$//'\\'')"'

# Enable programmable completion features
if ! shopt -oq posix; then
  if [ -f /usr/share/bash-completion/bash_completion ]; then
    . /usr/share/bash-completion/bash_completion
  elif [ -f /etc/bash_completion ]; then
    . /etc/bash_completion
  fi
fi`;
    }
    
    if (fileName === '.gitconfig') {
      return `[user]
	name = fr4iser
	email = fr4iser@example.com

[core]
	editor = nano
	autocrlf = input

[push]
	default = simple

[alias]
	st = status
	co = checkout
	br = branch
	ci = commit
	unstage = reset HEAD --
	last = log -1 HEAD
	visual = !gitk`;
    }
    
    if (fileName === '.zshrc') {
      return `# ~/.zshrc: Zsh configuration file

# Enable Powerlevel10k instant prompt
if [[ -r "\${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-\${(%):-%n}.zsh" ]]; then
  source "\${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-\${(%):-%n}.zsh"
fi

# History settings
HISTSIZE=10000
SAVEHIST=10000
HISTFILE=~/.zsh_history

# Options
setopt HIST_IGNORE_DUPS
setopt HIST_IGNORE_ALL_DUPS
setopt HIST_SAVE_NO_DUPS
setopt HIST_FIND_NO_DUPS
setopt HIST_REDUCE_BLANKS
setopt INC_APPEND_HISTORY
setopt SHARE_HISTORY

# Aliases
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias grep='grep --color=auto'
alias fgrep='fgrep --color=auto'
alias egrep='egrep --color=auto'

# Auto-completion
autoload -Uz compinit
compinit

# Key bindings
bindkey -e`;
    }
    
    // File type specific content
    switch (ext) {
      case '.md':
        return `# ${baseName}\n\nThis is a markdown file.\n\n## Content\n\nSome content here...`;
      case '.txt':
        return `This is a text file named ${fileName}.\n\nIt contains some sample text content.`;
      case '.js':
        return `// ${fileName}\nconsole.log('Hello from ${fileName}!');`;
      case '.py':
        return `#!/usr/bin/env python3\n# ${fileName}\n\nprint("Hello from ${fileName}!")`;
      case '.json':
        return `{\n  "name": "${baseName}",\n  "description": "A JSON file",\n  "version": "1.0.0"\n}`;
      case '.yml':
      case '.yaml':
        return `# ${fileName}\nname: ${baseName}\ndescription: A YAML file\nversion: 1.0.0`;
      case '.sh':
        return `#!/bin/bash\n# ${fileName}\n\necho "Hello from ${fileName}!"`;
      case '.desktop':
        return `[Desktop Entry]\nVersion=1.0\nType=Application\nName=${baseName}\nComment=Application\nExec=${baseName}\nIcon=${baseName}\nTerminal=false\nCategories=Game;`;
      default:
        return `This is a file named ${fileName}.\n\nIt contains some sample content.`;
    }
  }
  
  // Convert the root structure
  (filesystem.filesystem as any)['/'] = {
    type: 'directory',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    size: 4096,
    modified: new Date().toISOString(),
    contents: {}
  };
  
  // Convert each top-level directory
  for (const [dirName, dirContent] of Object.entries(osStructure.filesystem)) {
    const convertedNode = convertNode(dirName, dirContent);
    if (convertedNode) {
      (filesystem.filesystem as any)['/'].contents[dirName] = convertedNode;
    }
  }
  
  // Fix the home directory structure - move user content to /home/{systemUser}
  if ((filesystem.filesystem as any)['/'].contents.home && (filesystem.filesystem as any)['/'].contents.home.contents) {
    const homeContents = (filesystem.filesystem as any)['/'].contents.home.contents;
    
    // Create proper /home/{systemUser} structure using REAL system user
    (filesystem.filesystem as any)['/'].contents.home.contents = {
      [systemUser]: {
        type: 'directory',
        permissions: 'drwxr-xr-x',
        owner: systemUser,
        group: systemUser,
        size: scriptsConfig.terminal.filesystem.directorySize,
        modified: new Date().toISOString(),
        contents: homeContents
      }
    };
  }
  
  // Write the filesystem file
  const filesystemPath = path.join(__dirname, '../../frontend/public/data/fake-filesystem.json');
  fs.writeFileSync(filesystemPath, JSON.stringify(filesystem, null, 2));
  
  console.log(`✅ Filesystem structure converted and saved to: ${filesystemPath}`);
  console.log(`📁 Root directories: ${Object.keys(osStructure.filesystem).join(', ')}`);
  console.log(`👤 System user: ${systemUser}`);
  console.log(`🖥️  System hostname: ${systemHostname}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  convertOsStructureToFilesystem();
}

export { convertOsStructureToFilesystem };
