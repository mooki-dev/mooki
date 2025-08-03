---
title: Configuration Neovim complète
date: '2025-07-10T09:07:00.000Z'
tags:
  - neovim
  - vim
  - editor
  - config
author: mooki
excerpt: 'Configuration complète de Neovim avec plugins, LSP et interface moderne'
category: configurations
readingTime: 25
---

# Configuration Neovim complète

Une configuration Neovim moderne avec LSP, autocomplétion et interface intuitive.

## Installation

### Sur Arch Linux

```bash
sudo pacman -S neovim
```

### Sur Ubuntu

```bash
sudo snap install nvim --classic
```

## Structure de configuration

```
~/.config/nvim/
├── init.lua
├── lua/
│   ├── plugins/
│   ├── config/
│   └── mappings.lua
```

## Configuration de base

```lua
-- init.lua
vim.opt.number = true
vim.opt.relativenumber = true
vim.opt.tabstop = 2
vim.opt.shiftwidth = 2
vim.opt.expandtab = true
```

## Gestionnaire de plugins

Installation de lazy.nvim :

```lua
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not vim.loop.fs_stat(lazypath) then
  vim.fn.system({
    "git",
    "clone",
    "--filter=blob:none",
    "https://github.com/folke/lazy.nvim.git",
    "--branch=stable",
    lazypath,
  })
end
vim.opt.rtp:prepend(lazypath)
```

## Plugins essentiels

### LSP

```lua
{
  'neovim/nvim-lspconfig',
  dependencies = {
    'mason.nvim',
    'mason-lspconfig.nvim',
  },
}
```

### Autocomplétion

```lua
{
  'hrsh7th/nvim-cmp',
  dependencies = {
    'hrsh7th/cmp-nvim-lsp',
    'hrsh7th/cmp-buffer',
  },
}
```

## Raccourcis clavier

```lua
vim.keymap.set('n', '<leader>ff', '<cmd>Telescope find_files<cr>')
vim.keymap.set('n', '<leader>fg', '<cmd>Telescope live_grep<cr>')
```

Cette configuration offre une expérience de développement moderne tout en conservant l'efficacité de Vim.
