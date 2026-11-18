> npm install

> npm run start

If you run the C# project 'JSLSApp' from the other repo you get syntax highlighting.
(you need to start it prior to running the Editor app, and if it wasn't started in time you need to restart the Editor)

- [ ] TreeView context menu doesn't work
- [ ] A lot of things are kinda scuffed I need to eat something


----

I think I want to ensure that `npm run start` is always all you need to run the Editor app itself.
But I am still interested in transpiling my own JavaScript.

But I was deciding on a few things of which are essentially:

1. What does "overdoing it entail" I feel like I have a good grasp on this, probably not 100% grasped but far more than what I did previously grasp it for (ummm English I'm tired.)
2. do I want to make my own `domain specific language (? is the phrase ?)` or do I want to write vanilla JavaScript that is runnable as is.
3. and this number is a response to 2. my response is: I want to write vanilla JavaScript and then transpile it where sensible
4. ^ so this is like I think of right now I want to inline every enum and remove their definitions ONLY when I execute some OTHER command

^ so like this other command, `npm run start` will work and use the vanilla javascript

^ but then I can write a C# app that transpiles my javascript

and then this other command is something like or maybe like make the production exe or something
you'd need to be able to do the exe with the just vanilla javascript

I mean that I want to also be able to make to the exe with my transpiler output



