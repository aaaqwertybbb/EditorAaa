/*
#################
# Goal of file: #
#################


I don't know what the previous version of this comment says I put some "====" after this update so you can see the old comment I haven't bothered to read it.

Instead of doing this stupid idea I thought I'd leave some better ideas to check to really emphasize that this is probably a waste of your time, and
that it (negatively) skyrockets code complexity, and destroys readability. List is in no particular order and by no means complete.
- loops
- high frequency code paths
- frequent allocations
- allocations that are never cleared by GC for one reason or another

You could get into "well file IO etc..." but the theme of this file's optimization is sort of garbage collection, and language related.
So it isn't the same category of optimization, and thus I'm not gonna say anything about other categories of optimization.

Not only that, but this entire file is speculative and based on intuition. The goofball that has been maintaining these numbers
all this time never once measured the performance impact, if it were positive, negative, maybe it just makes the computer happier but I haven't measured that either.

In Visual Studio Code you can open "build\__COMPILEDbundle__.js" after running 'npm run build' (npm install I think is the first one if you just cloned the repo for the first time)
And then ctrl+shift+p and type "Fold Level 1"
I think it's quite interesting.
You'll see that all the constants are compiled away with babel.
Interesting is not a measurement on whether spending your time doing this is worth it though.
^
I think doing it once for fun was but... at what point do you stop and think is this actually an improvement that
I should keep in my toolbox of extremely rare performance improvement techniques.
Instead of just blindly keeping these ints up to date.

====




!!!!
99.9% of code should NEVER be doing what I'm doing here. I thought the idea sounded interesting so I went playing around with it.
!!!!

The 'f' prefix appears a lot in this file. It was to stand for 'field'.
I started with the INTS, then I thought "I can't use 'f' for the "fields" that are stored in the Uint8Array
otherwise I won't at a glace know whether the "export const variable" is being used on the correct corresponding array."
So I ended up dropping the 'f' prefix for the Uint8Array even though that array just as much as the Uint32Array is conceptually
a bunch of "fields" in my mind.
i.e.: you'd have some class with fields, but now I'm just shoving them all into this array.

Every variable in javascript is in essence a reference.

Most engines optimize the storage of various primitives,
such that the reference's value is the value of the primitive itsel

They do this by tagging the reference to indicate that it is to be interpreted as a primitive value rather than a pointer.

That all being said.

The Garbage Collector when doing a marking phase of the "mark and sweep" algorithm still needs to
visit the primitive variables in order to confirm that they are tagged as a primitive.

The overhead of checking whether a variable is a primitive, then moving on to the next variable;
is less than that of if it were an object which then would require further visiting of the child nodes.
BUT even though it is less, this overhead is not zero.

This is VERY LIKELY over optimization. I wanted to try it nevertheless.
So, by allocating a Uint*Array, I can create a single reference that the garbage collector needs to check.
It sees that the children of that Uint*Array are primitive values, and thus it doesn't have to visit the children.
Thus 64 number variables, that would've been 64 visits during the marking phase of GC, become just 1 visit.


The next thing I'm doing is referring to these Uint*Array members by name through the use of export const fat arrow functions.
I want to avoid the cost of invoking these export const fat arrow functions, and remove the cost of their definitions.
The first statement needs to be that a JS engine might actually do what this file does at runtime through
their own inlining, or caching. But I wanted to ensure it occured in a way that felt confidently in control o

So to have complete control over the inlining of some state I define export const fat arrow functions that have an expression body.
I then use babel to replace all invocations of these fat arrow functions as the expression body itsel
Furthermore babel removes the definition of the export const fat arrow function from the AST entirely so there is literally 0 overhead,
it is as if I typed the expression body everywhere I typed the fat arrow function when it comes to the end compiled file.
*/

/**
 * having a boolean be a byte isn't ideal, but most engines store them as either 4bytes or 8bytes
 * 
 * primarily the goal is to remove the variable from the marking phase of gc.
 * because the boolean variable could store anything so the gc still has to check that it still stores a primitive
 * and that takes time albeit a small amount of time.
 * 
 * TODO: index 8 is available because 'EDI_onScroll_bool' was removed.
 * 
 * The code does not make local variables such as: 'export const bytes = export const BYTES',
 * because ES6 modules are expected (and thus module scopes remove the usefulness of making a local variable):
 *     index.html the script tag: 'type="module" src="..."'
 * 
 * Important: use '0' or '1' when assigning to an array entry.
 *     - "When you assign true to an entry in a Uint8Array, JavaScript handles the conversion automatically, but it forces the engine to do extra work at runtime." Google AI
 *     - "passing a boolean directly to a typed array can cause microscopic stutters if it triggers a JIT deoptimization." Google AI
 * LessImportant: '!BYTES[byteEDI_mousemove_eventListener_isActive]' versus 'BYTES[byteEDI_mousemove_eventListener_isActive] === 0'.
 *     - I'm being told by Google AI that these are "equivalent" in terms of performance.
 *     - I read what it said and I more or less agree so I'm not overly pressed to make these changes as much as I was the assignments.
 *     - Essentially some minifiers actually will replace
 *         - 'false' with '!1' and 
 *         - 'true' with '!0'
 *     - i.e.: such an expression is known to be rather performant.
 */
export const BYTES = new Uint8Array(48);

/** returns a number, beware '===' */
export const get_EDI_detailRank = () => BYTES[0];
export const set_EDI_detailRank = (byte) => BYTES[0] = byte;

/** returns a number, beware '===' */
export const get_EDI_recentBoundingClientRect_isNull_intFalsey = () => BYTES[1];
export const set_EDI_recentBoundingClientRect_isNull_intFalsey = (byte) => BYTES[1] = byte;
set_EDI_recentBoundingClientRect_isNull_intFalsey(1);

/** returns a number, beware '===' */
export const get_EDI_findOverlay_show = () => BYTES[2];
export const set_EDI_findOverlay_show = (byte) => BYTES[2] = byte;

export const byteEDI_editorHasFocus = 3;

/** returns a number, beware '===' */
export const get_EDI_fileStartsWithBom = () => BYTES[4];
export const set_EDI_fileStartsWithBom = (byte) => BYTES[4] = byte;

/** returns a number, beware '===' */
export const get_EDI_findOverlay_wasSearched = () => BYTES[5];
export const set_EDI_findOverlay_wasSearched = (byte) => BYTES[5] = byte;

/** returns a number, beware '===' */
export const get_EDI_findOverlay_options_matchWord = () => BYTES[6];
export const set_EDI_findOverlay_options_matchWord = (byte) => BYTES[6] = byte;

export const byteDIALOG_FindAll_options_matchWord = 7;

export const byteDIALOG_Settings_isDark = 8;
BYTES[byteDIALOG_Settings_isDark] = 1;

export const byteDIALOG_Settings_trueTabs_falseSpaces = 9;
BYTES[byteDIALOG_Settings_trueTabs_falseSpaces] = 1;

export const byteDIALOG_Settings_editorDebugShowAdjacentCharacters = 10;

/** TODO: what is this? */
export const byteDIALOG_hasBeenMeasured = 11;

export const byteDIALOG_windowExists = 12;

export const byteAUTOCOMPLETE_exists = 13;

export const byteAUTOCOMPLETE_isRenderPending = 14;

export const byteAUTOCOMPLETE_rect_isNull = 15;
BYTES[byteAUTOCOMPLETE_rect_isNull] = 1;

export const byteAUTOCOMPLETE_isCheckingTrailingEdge = 16;

export const byteAUTOCOMPLETE_scrollIsFetchingData = 17;

export const byteWIDGET_isRenderPending = 18;

export const byteDIALOG_isRenderPending = 19;

export const byteTOOLTIP_isRenderPending = 20;

/**
 * 0 => None
 * 1 => Show
 * 2 => Hide
 */
export const byteTOOLTIP_pending_renderKind = 21;

export const byteTOOLTIP_exists = 22;

/** TODO: seemingly could be made obsolete sensibly */
export const byteDIALOG_currentDialogKind = 23;

export const byteMENU_isRenderPending = 24;

export const byteWIDGET_WidgetKind_drawn = 25;

// ====
export const byteTreeView_byteret_pooledNode_nodeKind = 26;
export const byteEDI_byteret_pooledTrackedSyntax_trackedSyntaxKind = 26;
// ====

export const byteEDI_cursor_enterKeyEventKind = 27;

export const byteEDI_extensionKind = 28;



export const byteEDI_isChecking_cursorBlinkTrailingEdge = 29;

export const byteEDI_cursor_selectionDivExists = 30;

export const byteEDI_onResize_hasTrailingCall = 31;


export const byteEDI_mousemove_eventListener_isActive = 32;

export const byteEXPLORER_show = 33;
BYTES[byteEXPLORER_show] = 1;

export const byteEXPLORER_isRenderPending = 34;

export const byteEXPLORER_isCheckingTrailingEdge = 35;

export const byteEXPLORER_scrollIsFetchingData = 36;

export const byteEXPLORER_boundingClientRect_isValid = 37;


export const byteAUTOCOMPLETE_queueHead = 38;
export const byteAUTOCOMPLETE_queueTail = 39;

export const byteDIALOG_queueHead = 40;
export const byteDIALOG_queueTail = 41;

export const byteMENU_queueHead = 42;
export const byteMENU_queueTail = 43;

export const byteWIDGET_queueHead = 44;
export const byteWIDGET_queueTail = 45;

/**
 * 'await window.myAPI.editorSetClipboard(...);' needs to be followed up with 'BYTES[byteEDI_clipboard_may_have_changed] = 0'
 * When reading the clipboard use 'await EDI_read_clipboard();'
 */
export const byteEDI_duplication_may_have_changed = 46;
BYTES[byteEDI_duplication_may_have_changed] = 1;

/**
 * 'await window.myAPI.editorSetClipboard(...);' needs to be followed up with 'BYTES[byteEDI_clipboard_may_have_changed] = 0'
 * When reading the clipboard use 'await EDI_read_clipboard();'
 */
export const byteEDI_clipboard_may_have_changed = 47;
BYTES[byteEDI_clipboard_may_have_changed] = 1;

// BYTES[byteEXPLORER_boundingClientRect_isValid]

// TODO: some things to consider when moving from a boolean to BYTES
// - [ ] triple equals
// - [ ] type coercion overhead
// - [ ] Extremely high access BYTES move to the int fields if there would otherwise be both a local reference to the byteFields and intFields if it is sensible.
// - [ ] Move stored enums here if they're <= 255

// inclusive final index is 44

// Choose a power of 2 for the buffer size (e.g., 16, 32, 64).
// 32 is usually plenty for a single animation frame queue.
//export const BUFFER_SIZE = 32;
//export const BUFFER_MASK = (BUFFER_SIZE - 1);
// TODO: you get `32 - 1` no matter whether you include the parenthesis or not / I don't feel like dealing with this right now.
export const BUFFER_SIZE = 32;
export const BUFFER_MASK = 31;

export const CONST_EDI_ASCII_LINE_FEED = 10;
export const CONST_EDI_ASCII_TAB = 9;
export const CONST_EDI_ASCII_SPACE = 32;

/////////////////////

export const CONST_js_DOUBLEQUOTE_str = '"';
export const CONST_js_DOUBLEQUOTE_num = 34;

export const CONST_js_SINGLEQUOTE_str = '\'';
export const CONST_js_SINGLEQUOTE_num = 39;

export const CONST_js_BACKTICK_str = '`';
export const CONST_js_BACKTICK_num = 96;

export const CONST_js_FORWARDSLASH_str = '/';
export const CONST_js_FORWARDSLASH_num = 47;

export const CONST_js_BACKSLASH_str = '\\';
export const CONST_js_BACKSLASH_num = 92;

export const CONST_js_ASTERISK_str = '*';
export const CONST_js_ASTERISK_num = 42;

export const CONST_js_LINEFEED_str = '\n';
export const CONST_js_LINEFEED_num = 10;

export const CONST_js_OPENPARENTHESIS_str = '(';
export const CONST_js_OPENPARENTHESIS_num = 40;

export const CONST_js_CLOSEPARENTHESIS_str = ')';
export const CONST_js_CLOSEPARENTHESIS_num = 41;

export const CONST_js_PERIOD_str = '.';
export const CONST_js_PERIOD_num = 46;

export const CONST_js_EQUALS_str = '=';
export const CONST_js_EQUALS_num = 61;

export const CONST_js_OPENBRACKET_str = '[';
export const CONST_js_OPENBRACKET_num = 60;

export const CONST_js_CLOSEBRACKET_str = ']';
export const CONST_js_CLOSEBRACKET_num = 62;

export const CONST_js_BANG_str = '!';
export const CONST_js_BANG_num = 33;

export const CONST_js_PLUS_str = '+';
export const CONST_js_PLUS_num = 43;

export const CONST_js_MINUS_str = '-';
export const CONST_js_MINUS_num = 45;

export const CONST_js_STAR_str = '*';
export const CONST_js_STAR_num = 42;

export const CONST_js_PERCENT_str = '%';
export const CONST_js_PERCENT_num = 37;

export const CONST_js_AMPERSAND_str = '&';
export const CONST_js_AMPERSAND_num = 38;

export const CONST_js_PIPE_str = '|';
export const CONST_js_PIPE_num = 24;

export const CONST_js_QUESTIONMARK_str = '?';
export const CONST_js_QUESTIONMARK_num = 63;

export const CONST_js_CARET_str = '^';
export const CONST_js_CARET_num = 94;

// Well I know exactly why it is here I just... I'm afraid of commitment. And I've made a lot of decisions today so the idea of making one more just causes anxiety so I'm settling for commenting it out for now you know hwat I mean?
//export const CONST_js_COLON_num = 58;

export const EDI_gutterPaddingLeft = 3;
export const EDI_gutterPaddingRight = 6;

export const CONST_DIALOG_minTop = 8;
export const CONST_DIALOG_minLeft = 8;
export const CONST_DIALOG_minHeight = 100;
export const CONST_DIALOG_minWidth = 100;

/** Pixels */
export const CONST_EXPLORER_offsetPerDepth = 8;

// Google AI'd the bit logic
// Configuration matching our table above
export const CONST_EXPLORER_KEY_BITS = 12;

// TODO: Consider using these (need to add them to babel plugin if you do)
//export const CONST_EXPLORER_isExpandedText = '-';
//export const CONST_EXPLORER_NOTisExpandedText = '+';
//export const CONST_EXPLORER_cannotBeExpandedText = '';

/**
 * I'm not sure how large I want this, what matters is that I just have a size of anything for the time being, then can change this constant later.
 */
export const CONST_EDI_cursor_GAP_BUFFER_CAPACITY = 32;

export const CONST_AUTOCOMPLETE_topPadding = 4;

export const CONST_EDI_cursor_htmlId = "EDI_cursor-1";


////////////////////////////
////////////////////////////
////////////////////////////

/**
 * unsigned int32 array
 * TODO: Rename to 'UINTS'?
 * 
 * The code does not make local variables such as: 'export const ints = export const INTS',
 * because ES6 modules are expected (and thus module scopes remove the usefulness of making a local variable):
 *     index.html the script tag: 'type="module" src="..."'
 */
export const INTS = new Uint32Array(129);

export const fEDI_lineHeight = 0;
INTS[fEDI_lineHeight] = 20;

/** The first line of text that you should see shown in the UI given the current scrollTop */
export const fEDI_virtualIndexLine = 1;

export const fEDI_ONSCROLLvirtualIndexLine = 2;
//throw new Error('-1');
// This set used to be -1 to indicate a non existent value, 500 "seems to work" but a proof of it being an equivalent solution has not thoroughly been thought out, only a sort of "yeah that probably works" kinda vibe.
INTS[fEDI_ONSCROLLvirtualIndexLine] = 500;

/**
 * I'm gonna store this in the int32 array so that the editor scroll render function can access it from the already existing local reference of INTS.
 */
export const fEDI_cursor_editKind = 3;

/** TODO: Rename to 'fEDI_ringBuffer_length' */
export const fEDI_ArrayFrom_textElement_children_length = 4;

// And this -1
export const fEDI_ringBuffer_indexZero = 5;

/** TODO: obsolete? just use 'INTS[fEDI_ArrayFrom_textElement_children_length]' */
export const fEDI_ONSCROLLvirtualCount = 6;

export const fEDI_lineEndPositionList_count = 7;

export const fEDI_styleBuffer_count = 8;

export const fEDI_queueHead = 9;
export const fEDI_queueTail = 10;
export const fEDI_isRenderPending = 11;

export const fEDI_virtualCount = 12;



export const fEDI_cursorBlinkingTrailingEdgeTimeoutId = 13;

export const fEDI_drawn_count_of_digits_longest_line_number = 14;

export const fEDI_detail_smallPosition = 15;

export const fEDI_detail_largePosition = 16;

export const fEDI_detailRank3OriginLine = 17;

/**
 * Pixels.
 * 
 * The gutter width changes far more frequently than the line height.
 * That is why the gutter width is a JavaScript variable, and the styles are updated from JavaScript.
 * 
 * Whereas the line height is a css variable (and thus could cause layout for the entire application whenever it changes).
 */
export const EDI_gutterWidthStyleValue = 18;
INTS[EDI_gutterWidthStyleValue] = 32;

/**
 * This is the sum of the 'EDI_gutterWidthStyleValue()' in addition to paddig
 * consider 'gutterWidthTotal_withPxUnits'
 */
export const EDI_gutterWidthTotal = 19;
/** WARNING: This will not set 'gutterWidthTotal_withPxUnits' and thus is somewhat prone to a mistake at some point. */
INTS[EDI_gutterWidthTotal] = 32;

export const fEDI_longestLine_indexLine = 20;

export const fEDI_longestLine_length = 21;

/**
 * The fEDI_contentWidth() is calculated via Math.ceil(someVar * otherVar) so this is faster to check whether content width will change rather than the multiplication and ceil.
 */
export const fEDI_longestLine_length_PreviousValueWhenLastDrewHorizontalScrollbar = 22;

export const fEDI_contentWidth = 23;

export const fEDI_indent_SMALL_lineAndColumnIndices_indexLine = 24;

export const fEDI_indent_startingIndex = 25;

export const fEDI_recentBoundingClientRect_left = 26;

export const fEDI_recentBoundingClientRect_top = 27;

// ====
export const fTreeView_poolret_pooledNode_key = 28;
/** TODO: obsolete */
export const fEDI_poolret_pooledTrackedSyntax_start = 28;

export const fTreeView_poolret_pooledNode_depth = 29;
/** TODO: obsolete */
export const fEDI_poolret_pooledTrackedSyntax_length = 29;
// ====

export const fEDI_cursor_indexLine = 30;
export const fEDI_cursor_indexColumn = 31;

/**
 * When moving cursor vertically, if the current column index cannot be matched due to the upcoming line being too short,
 * then this will allow a later vertical movement to a line that is long enough to match the original column rather than the minimized one.
 */
export const fEDI_cursor_STORED_visualWidth = 32;

export const fEDI_cursor_cursorTranslateYValue = 33;

export const fEDI_render_do_ScrollTrailingEdgeCheckTimeoutId = 34;

export const fEDI_cursor_selectionAnchor = 35;
export const fEDI_cursor_selectionEnd = 36;

export const fEDI_cursor_selectionIndexAnchorLine = 37;
export const fEDI_cursor_selectionIndexAnchorColumn = 38;

export const fEDI_cursor_selectionIndexEndLine = 39;
export const fEDI_cursor_selectionIndexEndColumn = 40;

export const fEDI_cursor_DRAWN_selectionAnchor = 41;
export const fEDI_cursor_DRAWN_selectionEnd = 42;

export const fEDI_cursor_DRAWN_selection_virtualIndexLine = 43;
export const fEDI_cursor_DRAWN_selection_virtualCount = 44;

/**
 * Not every edit makes use of an editLength. Because some edits are more computationally expensive than others.
 * These computationally expensive edits only know the editLength at time of finalization.
 * This only ever should be the count of characters inserted or 0 if not applicable for the EditKind.
 */
export const fEDI_cursor_editLength_characters = 45;
// TODO: move 'export const fEDI_cursor_editLength_bytes = 104;' closer numerically and text position
export const fEDI_cursor_editPosition = 46;
export const fEDI_cursor_editIndexLine = 47;
export const fEDI_cursor_editIndexColumn = 48;
//TODO: move 'export const fEDI_cursor_edit_eventCount_occurred = 63;' closer (numerically and text position)
export const fEDI_cursor_edit_eventCount_drawn = 49;
/**
 * I'm changing the code in relation to this and some other variables but,
 * I'm more concerned with 'fEDI_cursor_edit_eventCount_occurred' and 'fEDI_cursor_edit_eventCount_drawn'
 * on the first go-around.
 * 
 * Specifically the idea that every edit's render function checks fEDI_cursor_edit_eventCount_drawn < fEDI_cursor_edit_eventCount_occurred
 * although this isn't even correct. It depends on the edit still.
 * 
 * Okay if you have a more optimized render function you set drawn to occurred.
 * If you have an unoptimized render function that is just a while loop you increment.
 */
export const fEDI_cursor_edit_eventCount_drawingStateContinuationValue = 50;
export const fEDI_cursor_END_editIndexLine = 51;
export const fEDI_cursor_END_editIndexColumn = 52;
export const fEDI_cursor_textInsertionBufferCount = 53;

/**
 * TODO: probably is sensible to use this for the enter key too but I'm firstly adding it for the sake of backspace so
 * I don't have to waste time looping over the removed text to find the line end positions that are being removed.
 * (I could do some kind of other tracking but I chose not to for no particular reason, well I think I chose this one out of laziness and that the other solutions long term like a
 *  list at the editor level 1 of them that is shared among all cursors is probably better or something.)
 * 
 * ========
 * 
 * TODO: Cursor should store this as -1 to signify false,
 * and then it is a number 0 to ... the offset in the pending line end position list
 * and then you have another number too separately that says the length of line endings that this cursor contributed to modifying.
 */
export const fEDI_cursor_editLineFeedCount = 54;


// TODO: Avoid re-using these locally after getting the w result (i.e.: avoid re-using over and over in a loop or something, probably make a local variable if accessed enough).
// TODO: Verify and update all the previously -1 cases
export const fEDI_w_indexColumn_Goal = 55;
export const fEDI_w_indexColumn_Sum = 56;

/**
 * This purposefully avoids the wording "edit length" in order to avoid accident / confusing / hard to read code
 * but in simplest terms this variable is the resulting 'editLength' that existed after a delete or backspace removed a line end.
 * 
 * This way you can always just check whether the "sub length" which is relative to the edit_flagLineChanged has removed all the
 * text that other line that you landed on without having yet finalized.
 */
export const fEDI_cursor_edit_flagLineChanged = 57;

/**
 * TODO: isn't this just the column index now that there's just a single div?
 * 
 * TODO: MAYBEo-b-s-o-l-e-t-eMAYBE
 */
export const fEDI_w_indexColumn_SpanTextContentRelative = 58;

// TODO: This -1
export const fEDI_w_ringBufferIndex = 59;

// just floor these on init / resize and set the style so if they want resize they have to explicit and it is non decimal?
export const fEDI_lastReadNumber_offsetHeight = 60;

export const fEDI_lastReadNumber_offsetWidth = 61;

export const fEDI_EDI_mouseOver_event_clientY = 62;

export const fEDI_EDI_mouseOver_event_clientX = 63;

export const fEDI_cursor_edit_eventCount_occurred = 64;

export const fEDI_onResize_timer = 66;

export const fEDI_hoverTimeout = 67;

// ====
/** 'ret_' will overwrite one another do not mix the function invocations without having read the values first */
export const fEDI_ret_getLineAndColumnIndices_indexLine = 68;
/** 'ret_' will overwrite one another do not mix the function invocations without having read the values first */
export const fEDI_ret_getLineBoundaryPositions_start = 68;
/** 'ret_' will overwrite one another do not mix the function invocations without having read the values first */
export const fEDI_ret_getIndexFromX_indexColumn = 68;

/** 'ret_' will overwrite one another do not mix the function invocations without having read the values first */
export const fEDI_ret_getLineAndColumnIndices_indexColumn = 69;
/** 'ret_' will overwrite one another do not mix the function invocations without having read the values first */
export const fEDI_ret_getLineBoundaryPositions_end = 69;
/** 'ret_' will overwrite one another do not mix the function invocations without having read the values first */
export const fEDI_ret_getIndexFromX_visualColumns = 69;
// ====

export const fEDI_cursorVisualColumnIndex = 70;

export const fAUTOCOMPLETE_isCheckingTrailingEdgeTimeoutId = 71;

export const fEDI_ontab_visualWidth_perCharacter = 72;

export const fEDI_cursor_selectionIndexAnchorColumnVISUAL = 73;
export const fEDI_cursor_selectionIndexEndColumnVISUAL = 74;

export const fEDI_cursor_selectionIndexAnchorColumnVISUAL_DRAWN = 75;
export const fEDI_cursor_selectionIndexEndColumnVISUAL_DRAWN = 76;

export const fEDI_detail_smallColumnVisual = 77;
export const fEDI_detail_largeColumnVisual = 78;

export const fEDI_cursor_cached_indentation_string_visualWidth = 79;

export const fEDI_cursor_editLengthVisual = 80;

export const EDI_textByteList_capacity = 81;
export const EDI_textByteList_count = 82;

export const fEDI_lineEndPositionList_capacity = 83;

// ====
/** 'editret_' will overwrite one another do not mix the function invocations without having read the values first */
export const fEDI_editret_cursor_EDI_duplicate_small = 84;
/** 'editret_' will overwrite one another do not mix the function invocations without having read the values first */
export const fEDI_editret_RemoveSelection_smallPosition = 84;
/** 'editret_' will overwrite one another do not mix the function invocations without having read the values first */
export const fEDI_editret_indentLess_startingLinePos_end = 84;
/** 'editret_' will overwrite one another do not mix the function invocations without having read the values first */
export const fEDI_editret_cursor_gapBufferWriteToSpanElement_SpanTextContentRelativeIndex = 84;

/** 'editret_' will overwrite one another do not mix the function invocations without having read the values first */
export const fEDI_editret_cursor_EDI_duplicate_length = 85;
/** 'editret_' will overwrite one another do not mix the function invocations without having read the values first */
export const fEDI_editret_RemoveSelection_largePosition = 85;

/** 'editret_' will overwrite one another do not mix the function invocations without having read the values first */
export const fEDI_editret_RemoveSelection_smallLineAndColumnIndices_small_indexLine = 86;

/** 'editret_' will overwrite one another do not mix the function invocations without having read the values first */
export const fEDI_editret_RemoveSelection_smallLineAndColumnIndices_small_indexColumn = 87;
// ====

export const fEDI_priorToLastJump_indexLine = 88;
export const fEDI_priorToLastJump_indexColumn = 89;

export const fEDI_styleBuffer_capacity = 90;

/**
 * When reading the clipboard use 'await EDI_read_clipboard();' and then read the result from this variable.
 * 
 * editPosition + this[i]
 */
export const fEDI_cursor_EDI_duplication_totalLineEndCount = 91;

/**
 * When reading the clipboard use 'await EDI_read_clipboard();' and then read the result from this variable.
 * editPosition + this[i]
 */
export const fEDI_cursor_EDI_paste_clipboardContent_totalLineEndCount = 92;

// I don't think 'slice' is in LSP specification but I need to start like this cause it is only way I'll get something "initially working".
/** TODO: This isn't used only set */
export const fAUTOCOMPLETE_items_slice_start = 93;
/** TODO: This isn't used only set */
export const fAUTOCOMPLETE_items_slice_end = 94;
export const fAUTOCOMPLETE_items_totalLength = 95;

export const fAUTOCOMPLETE_cursorIndex = 96;

export const fAUTOCOMPLETE_rectHeight = 97;
export const fAUTOCOMPLETE_rectLeft = 98;
/** TODO: This isn't used only set, but it probably will be used for mouse events just that they're not written yet? */
export const fAUTOCOMPLETE_rectTop = 99;

export const fAUTOCOMPLETE_sliceVirtualIndex_SLICE = 100;
export const fAUTOCOMPLETE_sliceVirtualCount_SLICE = 101;
export const fAUTOCOMPLETE_sliceRingBufferIndexZero_SLICE = 102;

export const fAUTOCOMPLETE_virtualCount = 103;
export const fAUTOCOMPLETE_virtualIndex = 104;
export const fAUTOCOMPLETE_ringBufferIndexZero = 105;

export const fAUTOCOMPLETE_scrollTop = 106;

export const fEDI_cursor_editLength_bytes = 107;

export const fAUTOCOMPLETE_WIDTH_NODE_DRAWN_NUMBER_IN_CH_UNITS_NO_PADDING = 108;
INTS[fAUTOCOMPLETE_WIDTH_NODE_DRAWN_NUMBER_IN_CH_UNITS_NO_PADDING] = 2;

/**
 * This value ought to be an int (no decimal places) due to its high frequency usage in drawing UI,
 * and visually this having decimal places being of little to no value to the user when you could just ceil whatever height measurement you get.
 * 
 * TODO: (speculation) I've never liked saying "line height" I believe that deals with the vertical alignment of text within some container is "line height" a good wording.
 * */
export const fAPP_lineHeight = 109;
INTS[fAUTOCOMPLETE_WIDTH_NODE_DRAWN_NUMBER_IN_CH_UNITS_NO_PADDING] = 20;

/**
 * start it at 1 because you thought about starting it at 0 then using a prefix incrementation to ensure the 0 state is never used as a means of detecting an empty state
 * but if someone changes the code and moves it to postfix incrementation then everything breaks so why even take that risk when you can just start at 1
 * then if they go from postfix to prefix then you simply miss out on the number 1 and the first ticketId is 2 who cares...
 * 
 * ticketId because you're standing in line at the deli in the supermarket and you've grabbed from the machine a paper that has your number on it
 * and you're waiting for your number to be called so you can get the turkey
 * 
 * > "what is it called when you are in line at a deli and they have a machine that prints a paper with a number on it"
 * 
 * < It is called a take-a-number system or a queue management system. It uses a ticket dispenser to give out paper numbers so people can wait in order without standing in a tight line.
 * 
 * okay yeah it is a ticket dispenser we're good
 */
export const fWIDGET_ticketId_counter = 110;
INTS[fWIDGET_ticketId_counter] = 1;

export const fWIDGET_ticketId_drawn = 111;

export const fWIDGETrenderKind_Show_countOfPendingRequests = 112;

export const fMENU_ticketId_counter = 113;
INTS[fMENU_ticketId_counter] = 1;

export const fMENU_ticketId_drawn = 114;

export const fMENU_renderKind_Set_countOfPendingRequests = 115;



/**
 * TODO: This is approaching the point of being obsolete
 * 
 * 8 or the measured value
 */
export const fEXPLORER_firstSpanWidthValue = 116;
INTS[fEXPLORER_firstSpanWidthValue] = 8;

export const fEXPLORER_menuOptionX = 117;
export const fEXPLORER_menuOptionY = 118;

/** TODO: obsolete */
export const fEXPLORER_itemHeightTotal = 119;

/** Consider the existence of such methods as 'state_cursor_setIndex' before mutating state directly */
export const fEXPLORER_cursorIndex = 120;

export const fEXPLORER_virtualIndex_ofScrollTop = 121;

/** Hacky: Must initialize to a number other than 0 or else nothing renders. */
export const fEXPLORER_virtualCount = 122;
INTS[fEXPLORER_virtualCount] = 1;

export const fEXPLORER_lastReadNumber_scrollTop = 123;

export const fEXPLORER_ringBufferIndexZero = 124;

export const fEXPLORER_ringBuffer_length = 125;

/** TODO: what height should this start at? applicationRendererRoot.ts will eventually run initialization logic that actually does the measuring. */
export const fEXPLORER_itemHeightNumber = 126;
INTS[fEXPLORER_itemHeightNumber] = 20;

export const fEXPLORER_boundingClientRect_left = 127;
export const fEXPLORER_boundingClientRect_top = 128;



// INTS[EDI_textByteList_capacity]



// TODO: if (!MENU_SET_index) { MENU_SET_index = 0; }



// for the ringBufferIndexZero etc... consider using max value?
// Although it might "just work" because you're using locals which would become negative?
// TODO: figure it out


export const EDI_baseElement = document.getElementById('EDITOR_inner_container');

export const EDI_scroll_viewport = EDI_baseElement.children[0];
export const EDI_virtualization_horizontal = EDI_baseElement.children[0].children[0];

export const EDI_viewport = EDI_baseElement.children[1];

export const EDI_gutter = EDI_baseElement.children[1].children[0];
export const EDI_gutter_canvas = EDI_baseElement.children[1].children[0].children[0];
export const EDI_text = EDI_baseElement.children[1].children[1];
export const EDI_text_canvas = EDI_baseElement.children[1].children[1].children[0];
export const EDI_cursor_canvas = EDI_baseElement.children[1].children[1].children[1];

/**
 * If you have an extension listed here, it is expected that the "function to invoke" exists.
 * As of right now any patterns to naming the function that gets invoked are tentative.
 * But I am not checking whether JS_full_lex or JS_line_lex exist, I'm just switching on ExtensionKind and presuming that function exists.
 */
export const ExtensionKind_None = 0;
export const ExtensionKind_JavaScript = 1;

/**
 * DeleteLtr and BackspaceRtl are both forms of removing text,
 * their edits are stored the same (i.e.: both in "the form of a delete" keypress)
 * The kind delete/backspace tells you how to restore the cursor when doing a ctrl+z and etc...?
 */
export const EditKind_None = 0;
export const EditKind_InsertLtr = 1;
export const EditKind_DeleteLtr = 2;
export const EditKind_BackspaceRtl = 3;
export const EditKind_RemoveTextNoBatching = 4;
export const EditKind_Tab = 5;
export const EditKind_IndentMore = 6;
export const EditKind_IndentLess = 7;
export const EditKind_Enter = 8;
export const EditKind_Paste = 9;
export const EditKind_Duplicate = 10;

/**
 * TODO: Long term this likely should be removed and all enter key logic reduced into an insertion but this will help in the time being.
 * TODO: There's tons of '0' checks rather than using 'EnterKeyEventKind_None' that I'm seeing throughout the code...
 */
export const EnterKeyEventKind_None = 0;
export const EnterKeyEventKind_StartOfLine = 1;
export const EnterKeyEventKind_AmongALine = 3;
export const EnterKeyEventKind_EndOfLine = 4;
export const EnterKeyEventKind_EndOfFile = 6;

/**
 * Do not change the order/values of these, they are used in equality comparisons, the larger the number says when double clicking between a character and a punctuation
 * whoever has larger number gets selected then the selection continues while the same kind is being read.
 * 
 * TODO: Bug only 1 character selected when punctuation then letterOrDigit click between them the letterOrDigit is more than 1 contiguous only 1 selected.
 */
export const CharacterKind_None = 0;
export const CharacterKind_Whitespace = 1;
export const CharacterKind_Punctuation = 2;
export const CharacterKind_LetterOrDigit = 3;

// see editorGlobal.js:
// > export const count_of_wellknown_renderKinds = ...;
//
// RenderKind_Cursor_n is to say
// renderKind - (count_of_wellknown_renderKinds - 1) => render the cursor at cursorList[result];
// ...
// maybe I'll change this to be the id of the cursor at some point cause I'm not sure if it holds up with cursor movement possibly changing their order in the list.
// but for now...
export const RenderKind_None = 0;
export const RenderKind_Scroll = 1;
export const RenderKind_Resize = 2;
export const RenderKind_InsertLtr = 3;
export const RenderKind_TabKey = 4;
export const RenderKind_IndentMore = 5;
export const RenderKind_IndentLess = 6;
export const RenderKind_BackspaceRtl = 7;
export const RenderKind_DeleteLtr = 8;
export const RenderKind_RemoveSelection = 9;
export const RenderKind_Enter = 10;
export const RenderKind_DuplicateOrPaste = 11;
export const RenderKind_Clear = 12;
export const RenderKind_SetText = 13;
export const RenderKind_CreateViewport = 14;
export const RenderKind_SyntaxHighlighting = 15;
/** non-primaryCursors won't scroll into view, */
export const RenderKind_Cursor_flag_scrollIntoViewExplicit = 16;
/** To have a cursor not scroll into view add request this render immediately after the 'RenderKind_Cursor_n'. */
export const RenderKind_Cursor_flag_doNotScrollIntoView = 17;
/** Add the index of the cursor */
export const RenderKind_Cursor_n = 18;

//export const UI_SLOT_SIZE = 32;
/**
 * // TODO: you get `32 - 1` no matter whether you include the parenthesis or not / I don't feel like dealing with this right now.
 * // UI_SLOT_SIZE - 1 // 31 (binary: 00011111)
 */
export const UI_SLOT_MASK = 31; // UI_SLOT_SIZE - 1 // 31 (binary: 00011111)

/**
 * Master allocation (e.g., 64 bytes total for two subsystems)
 * 
 * TODO: If you queue more than 32 renderKinds in a single frame you're gonna lose information. (remedy this?) see 'UI_SLOT_MASK = 31'
 */
export const MASTER_RENDER_BUFFER = new Uint8Array(128 /* export const MASTER_BUFFER_SIZE = 128; */);

// Define the unique byte offset where each UI's memory space begins
export const OFFSET_DIALOG      = 0;  // Slots 0 to 31
export const OFFSET_AUTOCOMPLETE = 32; // Slots 32 to 63
export const OFFSET_WIDGET = 64; // Slots 64 to 95
export const OFFSET_MENU = 96; // Slots 96 to 127


// TODO: '..._EDI_indent_ORIGINAL_indentBy()' is no longer in use














// TODO: probably can be made obsolete these various
// ```
// export const fEDI_editret_RemoveSelection_smallPosition = 71;
// export const fEDI_editret_RemoveSelection_largePosition = 72;
// ```
//
// if only one edit can exist at a time you only the count of int32 required for the edit which requires the most of them.
// and then you can share the int32 entries.
//
// tbh the same is kinda true for things like:
// export const fEDI_ret_getLineBoundaryPositions_start = 88;
// export const fEDI_ret_getLineBoundaryPositions_end = 89;
//
// you only need as many int32 as necessary for the largest amount of "return values" from a function.
// this means you'd have to immediately read them though so just think about it.
// maybe functions with low frequency invocations can share the same int32 entries or something.


/**
 * TODO: This comment was attached to the obsolete fDIALOG_width... int32's and may or may not be useful or meaningful I only glanced at it TODO: read the comment and decide.
 * 
 * defaults to viewport size then getBoundingClientRect says the exact pixels upon trying to resize
 * need to track resizes and store the useragent width/height by the onmousedown and then on resize get proportion and update left top width height.
 * 
 * 
 * 
 * 
 * TODO: This comment... determine if is meaningful / move it to the dialogGlobal.js if it is meaningful etc...
 * 
 * // TODO: Are 'fDIALOG_before_X' and 'fDIALOG_before_Y' actually doing anything?...
 * // ...When it comes to their after counterparts 'fDIALOG_after_X' and 'fDIALOG_after_Y'...
 * // ...it is believed that the counterparts are doing nothing, so also check the before.
 * 
 * 
 * 
 * 
 * TODO: This comment... determine if is meaningful / move it to the dialogGlobal.js if it is meaningful etc...
 * 
 * // TODO: What does 'fDIALOG_after_X' and 'fDIALOG_after_Y' even get used for? It seems they always only get set to 0 over and over and do nothing?
 * 
 * 
 */


// ============
// ============
// ============








// ============
// ============
// ============





// ============
// ============
// ============







// ============
// ============
// ============






/**
 * TODO: This comment was on both variables what was it referring to?
 * 
 * // same comment that pertains to EDI_cursor_EDI_paste_clipboardContent_string is somewhat relevant here
 * 
 * export const fEDI_editret_cursor_EDI_duplicate_small = 99;
 * export const fEDI_editret_cursor_EDI_duplicate_length = 100;
 */

