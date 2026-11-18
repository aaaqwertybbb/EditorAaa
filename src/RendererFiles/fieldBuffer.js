export const BUFFER_SIZE = 32;
export const BUFFER_MASK = 31;





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

