# Rafini

Rafini use RegEx, string manipulation and external web services (such as [themoviedb.org](https://www.themoviedb.org/)) to refine bad movies filename to clean, good looking one.

## Instalation

    yarn add rafini

## Usage

### As a module

    const Rafini = require('rafini');
    Rafini("Steve.Jobs.2015.FRENCH.BDRip.XviD-ViVi.avi")

### As CLI

    rafini "Steve.Jobs.2015.FRENCH.BDRip.XviD-ViVi.avi"

---

### Why rafini ?

In the past, [propre](https://github.com/yadomi/propre) was made. It works, it's local only and it's in Ruby.
Ruby is fine, Ruby is good, but Ruby doesn't integrate well in Javascript/NodeJS applications.

### Why the name Rafini ?

`Rafini` mean `refine` in esperento
