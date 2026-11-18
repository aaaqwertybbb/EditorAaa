import * as f from "./fieldBuffer.js"
import {
    TreeViewComponent,
    treeViewComponent_staticRunner,
    TreeViewNodeKind,
} from './treeViewComponent.js'
import {
    MENU_MenuOption_factory,
    CommandKind,
    menuSet,
} from './menuGlobal.js'
import {set_shouldUseCSharpToSaveFileWhenPossible, sendTransaction_MessageKind_textDocument_didOpen} from './applicationRendererRoot.js'
import {EDI_state_setText_byteArray, EDI_toExtensionKind} from './editorGlobal_edit.js'

class Explorer {
    constructor() {
        /**
         * TODO: This is approaching the point of being obsolete
         * 
         * 8 or the measured value
         */
        this.firstSpanWidthValue = 8;

        this.menuOptionX = 0;
        this.menuOptionY = 0;

        /** TODO: obsolete */
        this.itemHeightTotal = 0;

        /** Consider the existence of such methods as 'state_cursor_setIndex' before mutating state directly */
        this.cursorIndex = 0;

        this.virtualIndex_ofScrollTop = 0;

        /** Hacky: Must initialize to a number other than 0 or else nothing renders. */
        this.virtualCount = 1;

        this.lastReadNumber_scrollTop = 0;

        this.ringBufferIndexZero = 0;

        this.ringBuffer_length = 0;

        /** TODO: what height should this start at? applicationRendererRoot.ts will eventually run initialization logic that actually does the measuring. */
        this.itemHeightNumber = 20;

        this.boundingClientRect_left = 0;
        this.boundingClientRect_top = 0;
    }
}

/** Pixels */
export const CONST_EXPLORER_offsetPerDepth = 8;

// Google AI'd the bit logic
// Configuration matching our table above
export const CONST_EXPLORER_KEY_BITS = 12;

/*
When collapse maybe you reset the length of the longest line or something

===

also need to update the width of the cursor to the largest width seen div thing so it visually looks correct
need to make sure the code does a min-width esque logic. Probably don't want the css but just for the code that sets the style to consider it for you avoids min-width overhead if exists?


NO ASYNC EVENTS
- higher likelihood of memory leaking PerformanceEventTiming due to inability for browser to clear buffer on time requiring manual clearing of the long term buffer.
*/

const EXPLORER_pathIdToDisplayNameMap = new Map();

/**
 * @type {TreeViewComponent}
 */
const EXPLORER_treeViewComponent = new TreeViewComponent(16, treeViewComponent_staticRunner, EXPLORER_renderLines, EXPLORER_expandCollapseIconWasClicked, EXPLORER_dblClick_or_space_or_enter, EXPLORER_oncontextmenu);
EXPLORER_treeViewComponent.initialize(document.getElementById('EXPLORER'), null);

function EXPLORER_setChosenDirectory(chosenDirectoryAbsolutePath, chosenDirectoryBasename, chosenDirectoryAbsolutePathId) {
    EXPLORER_pathIdToDisplayNameMap.clear();
    EXPLORER_treeViewComponent.clear();
    if (!chosenDirectoryAbsolutePath) return;

    EXPLORER_treeViewComponent.insert(EXPLORER_treeViewComponent.countAbstract, TreeViewNodeKind.isExpandable_NOTisExpanded, chosenDirectoryAbsolutePathId, 0);
    EXPLORER_pathIdToDisplayNameMap.set(chosenDirectoryAbsolutePathId, chosenDirectoryBasename);
}

function EXPLORER_setChosenWorkspace(chooseWorkspaceResult) {
    EXPLORER_pathIdToDisplayNameMap.clear();
    EXPLORER_treeViewComponent.clear();
    if (!chooseWorkspaceResult.workspaceFileAbsolutePath) return;

    if (chooseWorkspaceResult.workspaceFileAbsolutePath === "C:\\Users\\hunte\\Repos\\New folder (7)\\Editor2.code-workspace") {
        // enable experimental behavior only if the path matches my own.
        // This is not 100% fool proof but for my temporary use case it is likely 100% secure
        // given the extremely small amount of people running the code i.e.: maybe I'm the only one that even runs this code I don't know.
        // Nevertheless for this sample size this statistically I imagine approaches 100% security.
        set_shouldUseCSharpToSaveFileWhenPossible(true);
    }

    for (let i = 0; i < chooseWorkspaceResult.directories.length; i++) {
        const directory = chooseWorkspaceResult.directories[i];
        EXPLORER_treeViewComponent.insert(EXPLORER_treeViewComponent.countAbstract, TreeViewNodeKind.isExpandable_NOTisExpanded, directory.id, 0);
        EXPLORER_pathIdToDisplayNameMap.set(directory.id, directory.basename);
    }
}

function EXPLORER_renderLines(lineIndexLower, lineIndexUpper, ringBufferIndex, decodingBoundLower, decodingBoundUpper) {

    const ctx = EXPLORER_treeViewComponent.canvasContext2d;
    ctx.clearRect(0, 0, EXPLORER_treeViewComponent.canvas.width, EXPLORER_treeViewComponent.canvas.height);
    
    let vertical = 0;

    // TODO: All of the below 'Optimization heuristic goal' suck. Cause you have no idea whether they're actually effective you're just hearing rumors and then throwing them all at a dart board and hoping everything works out.
    // ^ I'm specifically referencing my blind application of them en masse like a fool without ever having confirmed that they are improvements let alone meaningful ones.
    // ^ for absolute clarification I'm not saying the heuristics suck I'm saying I suck cause I never once validated their usefulness.
    //
    /** Optimization heuristic goal: assumedly reduce reference chasing by creating a const reference to fields that are frequently accessed via a member access on a reference variable. It is rumored that this permits loop optimization. */
    /** Optimization heuristic goal: similarly^ assumedly improve caching by explicitly telling the code generator that the reference which 'foo' points to "will not change". In garbage collection, when defragmenting the heap every reference to an object that was repositioned needs to have its reference updated to point to the new location of the object, so I'm not quite sure how this works out idk. It is rumored that this permits loop optimization. */
    const VIRTUAL_COUNT = EXPLORER_treeViewComponent.virtualCount;
    const COUNT_ABSTRACT = EXPLORER_treeViewComponent.countAbstract;
    const LINE_CACHE = EXPLORER_treeViewComponent.lineCacheRingBuffer;
    const ITEM_HEIGHT_NUMBER = EXPLORER_treeViewComponent.itemHeightNumber;
    /** Optimization heuristic goal: This one specifically is to bring this global scope variable into local scope rather than relying on caching alone this ought to signal further the importance of the variable being cached. It is rumored that this permits loop optimization. */
    const STRINGS_MAP_BY_PATH_ID = EXPLORER_pathIdToDisplayNameMap;

    /** Optimization heuristic goal: make the upper bound a constant, and do not modify 'i' within the loop, have not measured if this is truly impactful. It is rumored that this permits loop optimization. */
    const LINE_INDEX_UPPER = lineIndexUpper;

    // --- STEP 2: RENDER ACTIVE SOLID CURSOR LINE ---
    ctx.fillStyle = '#3f7581'; // Solid cursor accent color
    const cursorLine = EXPLORER_treeViewComponent.cursorIndex;
    if (cursorLine >= lineIndexLower && cursorLine < lineIndexUpper) {
        const cursorY = (cursorLine - lineIndexLower) * EXPLORER_treeViewComponent.itemHeightNumber;
        ctx.fillRect(0, cursorY, EXPLORER_treeViewComponent.canvas.width, EXPLORER_treeViewComponent.itemHeightNumber);
    }

    ctx.fillStyle = '#d4d4d4';

    let previousDepthString = '';
    let previousDepthStringDepth = 0;

    for (let i = lineIndexLower; i < LINE_INDEX_UPPER; i++) {
        ringBufferIndex++;
        if (ringBufferIndex >= VIRTUAL_COUNT) {
            ringBufferIndex -= VIRTUAL_COUNT;
        }

        if (i >= decodingBoundLower && i < decodingBoundUpper) {
            if (i < COUNT_ABSTRACT) {
                EXPLORER_treeViewComponent.getElementAt(i);
                const key = f.fTreeView_poolret_pooledNode_key;
                const depth = f.fTreeView_poolret_pooledNode_depth;
                const nodeKind = f.byteTreeView_byteret_pooledNode_nodeKind;

                let name = STRINGS_MAP_BY_PATH_ID.get(key) ?? `unknown_${i}`;
                let chevronRepresentation = ' ';
                switch (nodeKind) {
                    case TreeViewNodeKind.isExpandable_isExpanded:
                        chevronRepresentation = '-';
                        break;
                    case TreeViewNodeKind.isExpandable_NOTisExpanded:
                        chevronRepresentation = '+';
                        break;
                    case TreeViewNodeKind.NOTisExpandable_isExpanded:
                        chevronRepresentation = '';
                        break;
                    case TreeViewNodeKind.NOTisExpandable_NOTisExpanded:
                        chevronRepresentation = '';
                        break;
                }
                // I see what I was doing here now. I don't want to query depth in order to render something that was already cached with respect to text...
                // ...ummm TODO: decide on this, maybe you should just query depth in order to render something.
                if (previousDepthStringDepth !== depth) { // TODO: this is probably premature and unmeasured optimization that can thrash and provide no benefit when alternating back and forth between depth values.
                    previousDepthString = ' '.repeat(depth * EXPLORER_treeViewComponent.offsetPerDepthInCharacterWidths);
                    previousDepthStringDepth = depth;
                }
                LINE_CACHE[ringBufferIndex] = previousDepthString + chevronRepresentation + name;
            }
            else {
                LINE_CACHE[ringBufferIndex] = '~';
            }
        }

        ctx.fillText(LINE_CACHE[ringBufferIndex], 0, vertical); // There's a max width argument in the fillText?
        vertical += ITEM_HEIGHT_NUMBER;
    }
}

async function EXPLORER_expandCollapseIconWasClicked(divItem, indexItem, ringBufferIndexItem) {
    EXPLORER_treeViewComponent.getElementAt(indexItem);
    const key = f.fTreeView_poolret_pooledNode_key;
    const depth = f.fTreeView_poolret_pooledNode_depth;
    const nodeKind = f.byteTreeView_byteret_pooledNode_nodeKind;

    if (nodeKind === TreeViewNodeKind.isExpandable_NOTisExpanded) {
        EXPLORER_treeViewComponent.setNodeKind(indexItem, TreeViewNodeKind.isExpandable_isExpanded);

        const childFilesystemEntries = await window.myAPI.getFilesystemEntries_argumentIsId(key);
        const insertionCount = childFilesystemEntries.length;
        if (insertionCount === 0) { return; }

        for (let i = 0; i < insertionCount; i++) {
            const entry = childFilesystemEntries[i];
            const nodeKind = entry.isDirectory
                ? TreeViewNodeKind.isExpandable_NOTisExpanded
                : TreeViewNodeKind.NOTisExpandable_NOTisExpanded;
            // TODO: Insert range, or at the least 'pre-emptively' resize the list so that it fits each insertion without resizing per insertion.
            EXPLORER_treeViewComponent.insert(indexItem + 1 + i, nodeKind, entry.id, depth + 1);
            EXPLORER_pathIdToDisplayNameMap.set(entry.id, entry.basename);
        }

        EXPLORER_treeViewComponent.itemHeightTotal = EXPLORER_treeViewComponent.countAbstract * EXPLORER_treeViewComponent.itemHeightNumber;
        EXPLORER_treeViewComponent.scrollbarSpaceGenerator.style.height = EXPLORER_treeViewComponent.itemHeightTotal + 'px';

        EXPLORER_treeViewComponent.forceFullscreen_renderScroll();
    }
    else if (nodeKind === TreeViewNodeKind.isExpandable_isExpanded) {
        EXPLORER_treeViewComponent.setNodeKind(indexItem, TreeViewNodeKind.isExpandable_NOTisExpanded);
        EXPLORER_treeViewComponent.forceFullscreen_renderScroll();

        let countChildren = 0;
        for (let i = indexItem + 1; i < EXPLORER_treeViewComponent.countAbstract; i++) {
            // If currentDepth < ithElementDepth; // then current is a parent of ithElement.
            if (depth < EXPLORER_treeViewComponent.getDepth(i)) {
                countChildren++;
            }
            else {
                break;
            }
        }

        if (countChildren === 0) { return; }

        EXPLORER_treeViewComponent.removeAt(indexItem + 1, countChildren);
        
        EXPLORER_treeViewComponent.itemHeightTotal = EXPLORER_treeViewComponent.countAbstract * EXPLORER_treeViewComponent.itemHeightNumber;
        EXPLORER_treeViewComponent.scrollbarSpaceGenerator.style.height = EXPLORER_treeViewComponent.itemHeightTotal + 'px';

        EXPLORER_treeViewComponent.forceFullscreen_renderScroll();
    }
}

async function EXPLORER_dblClick_or_space_or_enter(eventKey, indexItem, ringBufferIndexItem) {
    EXPLORER_treeViewComponent.getElementAt(indexItem);
    let key = f.fTreeView_poolret_pooledNode_key;
    let nodeKind = f.byteTreeView_byteret_pooledNode_nodeKind;

    if (nodeKind === TreeViewNodeKind.NOTisExpandable_NOTisExpanded) {
        // TODO: open the file by id in one ipc call
        const entry = await window.myAPI.getFilesystemEntryById(key);
        if (!entry) return;

        if (!entry.isDirectory) {
            // TODO: eventKey!==' ' feels a bit awkward. (I don't think dblClick has a eventKey is the issue but if you check !space...?)
            await EXPLORER_openInEditor(entry.absolutePath, /*shouldFocus*/ eventKey!==' ');
        }
    }
}

function EXPLORER_oncontextmenu(divItem, indexItem, event_button, event_clientX, event_clientY, relativeIndex) {
    let optionList = [
        MENU_MenuOption_factory(CommandKind.Copy, 'Copy'),
        MENU_MenuOption_factory(CommandKind.CopyAbsolutePath, 'Copy Absolute Path'),
    ];

    // TODO: !!!! You might need to be careful with async and the TreeView_pooledNode; I'm not certain whether you do or don't have to be careful, and I don't feel like looking into it at the moment.
    EXPLORER_treeViewComponent.getElementAt(indexItem);
    let key = f.fTreeView_poolret_pooledNode_key;
    let depth = f.fTreeView_poolret_pooledNode_depth;
    let nodeKind = f.byteTreeView_byteret_pooledNode_nodeKind;

    let target = {
        id: key,
        depth: depth,
        nodeKind: nodeKind,
        indexItem: indexItem,
        divRelativeIndex: relativeIndex,
    };

    let left = 0;
    let top = 0;

    if (event_button === 2) {
        EXPLORER_addSpecificMenuOptionsForTarget(optionList, divItem, target);
        left = f.fEXPLORER_menuOptionX = event_clientX;
        top = f.fEXPLORER_menuOptionY = event_clientY;
    }
    else {
        EXPLORER_addSpecificMenuOptionsForTarget(optionList, divItem, target);
        left = f.fEXPLORER_menuOptionX=f.fEXPLORER_boundingClientRect_left;
        top = f.fEXPLORER_menuOptionY = (f.fEXPLORER_boundingClientRect_top + ((f.fEXPLORER_cursorIndex + 1) * f.fEXPLORER_itemHeightNumber) - f.fEXPLORER_lastReadNumber_scrollTop);
    }

    menuSet(optionList, left, top, EXPLORER_MenuOnClick, target, /*elementToFocusOnCompleted*/ null, /*disableFocusOnCompleted*/ false, /*index*/ 0);
}

/**
 * This method should only pertain itself with the contents of the flat list, any UI changes will be made based on the returned 'changeCount'
 * which is interpreted as one for the item itself, plus the count of any children that were recursively removed.
 * 
 * TODO: Include the word "directory"?
 * 
 * @param {*} indexItem 
 * @returns 
 */
function EXPLORER_removeFromNodeList(indexItem) {
    EXPLORER_treeViewNodes.getElementAt(indexItem);
    let depth = f.fTreeView_poolret_pooledNode_depth;
    let nodeKind = f.byteTreeView_byteret_pooledNode_nodeKind;

    if (nodeKind === TreeViewNodeKind.NOTisExpandable_isExpanded) {
        alert("TODO: if (nodeKind === ...TreeViewNodeKind.NOTisExpandable_isExpanded())");
        return;
    }

    let countChildren = 0;

    if (nodeKind === TreeViewNodeKind.isExpandable_isExpanded) {
        for (let i = indexItem + 1; i < EXPLORER_treeViewNodes.count_abstract; i++) {
            // If currentDepth < ithElementDepth; then current is a parent of ithElement.
            if (depth < EXPLORER_treeViewNodes.getDepth(i)) {
                countChildren++;
            }
            else {
                break;
            }
        }
    }

    EXPLORER_treeViewNodes.removeAt(indexItem, 1 + countChildren);
    f.fEXPLORER_itemHeightTotal = EXPLORER_treeViewNodes.count_abstract * f.fEXPLORER_itemHeightNumber;
    EXPLORER_scrollbar_space_generator.style.height = f.fEXPLORER_itemHeightTotal + 'px';
    return 1 + countChildren;
}

/** TODO: any usage of this needs to respect the actual zeroth UI div not the literal. */
function EXPLORER_setNodeListEntryId(indexItem, pathId) {
    EXPLORER_treeViewNodes.setKey(indexItem, pathId);
}

function EXPLORER_addSpecificMenuOptionsForTarget(optionList, divItem, target) {
    if (!divItem) return;

    // check the "text icon": { '-', '+', '' }
    if (target.nodeKind === TreeViewNodeKind.isExpandable_isExpanded ||
        target.nodeKind === TreeViewNodeKind.isExpandable_NOTisExpanded) {
        
        // Directory
        optionList.push(MENU_MenuOption_factory(CommandKind.NewFile_File, 'NewFile'));
        optionList.push(MENU_MenuOption_factory(CommandKind.NewFile_Directory, 'NewDirectory'));
        optionList.push(MENU_MenuOption_factory(CommandKind.DeleteFile_Directory, 'Delete'));
        optionList.push(MENU_MenuOption_factory(CommandKind.RenameFile_Directory, 'Rename'));
        optionList.push(MENU_MenuOption_factory(CommandKind.Paste, 'Paste'));
        optionList.push(MENU_MenuOption_factory(CommandKind.Cut, 'Cut'));
    }
    else {
        // File
        optionList.push(MENU_MenuOption_factory(CommandKind.DeleteFile_File, 'Delete'));
        optionList.push(MENU_MenuOption_factory(CommandKind.RenameFile_File, 'Rename'));
        optionList.push(MENU_MenuOption_factory(CommandKind.Cut, 'Cut'));
    }
}

/*
TODO: The TreeView after you resize it, you can continually scroll down and it keeps replacing more and more '~' lines
        even if you've scrolled through everything already.
        This is probably some kind of rounding error?
        It porbably happens regardless of whether you resized
        and more-so that you just happen to have hit the perfect height for it to happen?
*/

/** 8px by default or the measured value with px */
export let EXPLORER_firstSpanWidth = '8px';
export function set_EXPLORER_firstSpanWidth(value) {
    EXPLORER_firstSpanWidth = value;
}

/**
 * TODO: Only use a single menuOptionCut_object that is located in "MENU_" to reduce the chance of memory leaks due to a 'cut' that never gets
 * followed up with a paste or etc... then you have like 3 active menu cut objects sitting around eventually, you probably want them to overwrite eachother.
 * You'd need to track the source of the cut menu object though if you were to do this.
 */
let EXPLORER_menuOptionCut_object = null;

// function EXPLORER_init
// V8 can optimize away these initialization statements that exist at the module scope but not an "initialization function"
const EXPLORER_pickFolderOrWorkspaceButton = document.getElementById('EXPLORER_folderOrWorkspaceButtons');
if (EXPLORER_pickFolderOrWorkspaceButton) { EXPLORER_pickFolderOrWorkspaceButton.addEventListener('click', EXPLORER_pickFolderOrWorkspaceButton_onClick); }
//
let toggleShowExplorerButton = document.getElementById('HEADER_toggleShowExplorer');
toggleShowExplorerButton.checked = f.byteEXPLORER_show;
toggleShowExplorerButton.addEventListener('click', toggleShowExplorerButton_onClick);

function toggleShowExplorerButton_onClick() {
    // TODO: Will shadowing 'toggleShowExplorerButton' with a declaration of the same name in here cause any oddities in relation to app long garbage collection overhead....
    // ...presumably the answer is 99.999% no but I can't bear to deal with this right now, thus the variable name 'avoidClosureCausingAppLongLivingVariable_toggleShowExplorerButton'.
    let avoidClosureCausingAppLongLivingVariable_toggleShowExplorerButton = document.getElementById('HEADER_toggleShowExplorer');
    if (avoidClosureCausingAppLongLivingVariable_toggleShowExplorerButton) {
        EXPLORER_setShow(avoidClosureCausingAppLongLivingVariable_toggleShowExplorerButton.checked);
    }
}

async function EXPLORER_pickFolderOrWorkspaceButton_onClick() {
    const EXPLORER_pickFolderOrWorkspaceButton = document.getElementById('EXPLORER_folderOrWorkspaceButtons');
    let optionList = [
        MENU_MenuOption_factory(CommandKind.SelectFolder, 'Folder'),
        MENU_MenuOption_factory(CommandKind.SelectWorkspace, 'Workspace'),
    ];
    let boundingClientRect = EXPLORER_pickFolderOrWorkspaceButton.getBoundingClientRect();
    menuSet(optionList, boundingClientRect.left, boundingClientRect.top + boundingClientRect.height, EXPLORER_pickFolderOrWorkspaceButton_MenuOnClick, /*target*/ null, /*elementToFocusOnCompleted*/ null, /*disableFocusOnCompleted*/ false, /*index*/ 0);
}

/**
Hiding an element's visibility rather than removing the HTML has a cost associated with it.
If a UI piece isn't integral to the app, I wouldn't even transitionally use this as a solution
because it could "slip through the cracks" and never get optimized.

That being said, the explorer in this app IS integral, so I'll go down this route to start off.

...more details involved but I'm thinking and deciding.
*/
function EXPLORER_setShow(shouldShow) {
    const EXPLORER_Element = document.getElementById('EXPLORER');
    if (!EXPLORER_Element) return;

	if (shouldShow && !f.byteEXPLORER_show) {
		let editorHackElement = document.getElementById('EDI_hack');
		EXPLORER_Element.style.width = '200px';
		EXPLORER_Element.style.visibility = '';
		editorHackElement.style.width = 'calc(100% - 200px)';
		f.byteEXPLORER_show = shouldShow;
		let toggleShowExplorerButton = document.getElementById('HEADER_toggleShowExplorer');
		toggleShowExplorerButton.checked = f.byteEXPLORER_show;
		EDI_onResize();
	}
	else if (!shouldShow && f.byteEXPLORER_show) {
		// !show is redundant, but exists for readability.
		let editorHackElement = document.getElementById('EDI_hack');
		EXPLORER_Element.style.width = '0px';
		EXPLORER_Element.style.visibility = 'hidden';
		editorHackElement.style.width = '100%';
		f.byteEXPLORER_show = shouldShow;
		let toggleShowExplorerButton = document.getElementById('HEADER_toggleShowExplorer');
		toggleShowExplorerButton.checked = f.byteEXPLORER_show;
		EDI_onResize();
	}
}

async function EXPLORER_openInEditor(absolutePath, shouldFocus) {
    const itHasBom = await window.myAPI.editorReadAllText_byteArray(absolutePath);

    if (!itHasBom.paddedUint8Array) {
        return;
    }

    EDI_state_setText_byteArray(
        itHasBom.paddedUint8Array,
        itHasBom.textByteLength,
        itHasBom.fileStartsWithBom,
        /*textSourceIdentifier*/ absolutePath,
        /*FORMATTED_textSourceIdentifier*/ itHasBom.formattedAbsolutePath,
        /*extensionKind*/ EDI_toExtensionKind(itHasBom.extension),
        itHasBom.lineEndString,
        itHasBom.lineEndCount);

    if (shouldFocus) {
        let editor = document.getElementById('EDITOR_inner_container');
        if (editor) {
            editor.focus();
        }
    }

    sendTransaction_MessageKind_textDocument_didOpen(itHasBom.formattedAbsolutePath);
}

/**
 * 
 * @param {*} isCancelled 
 * @param {MenuOption} menuOption 
 * @param {*} request 
 * @returns 
 */
async function EXPLORER_pickFolderOrWorkspaceButton_MenuOnClick(isCancelled, menuOption, request) {
    if (isCancelled || !menuOption) { return; }
    
    const commandKind = menuOption.commandKind;
    if (!commandKind) { return; }

    switch (commandKind) {
        case CommandKind.SelectFolder:
            {
                const EXPLORER_Element = document.getElementById('EXPLORER');
                if (!EXPLORER_Element) return;
                const EXPLORER_PickFolder = document.getElementById('EXPLORER_folderOrWorkspaceButtons');
                if (!EXPLORER_PickFolder) return;
    
                // { basename: basename, openedDirectory: openedDirectory }
                let chooseDirectoryResult = await window.myAPI.chooseDirectory();
                if (chooseDirectoryResult.canceled) return;
    
                EXPLORER_setShow(true);
                let chosenDirectoryAbsolutePath = chooseDirectoryResult.openedDirectory;
                EXPLORER_PickFolder.textContent = chooseDirectoryResult.basename;
                EXPLORER_PickFolder.title = chosenDirectoryAbsolutePath;
    
                EXPLORER_setChosenDirectory(chosenDirectoryAbsolutePath, chooseDirectoryResult.basename, chooseDirectoryResult.id);
                EXPLORER_treeViewComponent.resetTheUi();
            }
            break;
        case CommandKind.SelectWorkspace:
            {
                const EXPLORER_Element = document.getElementById('EXPLORER');
                if (!EXPLORER_Element) return;
                
                let chooseWorkspaceResult = await window.myAPI.chooseWorkspace();
                if (chooseWorkspaceResult.canceled) return;
    
                EXPLORER_setShow(true);
    
                let pickWorkspaceButton = document.getElementById('EXPLORER_folderOrWorkspaceButtons');
                pickWorkspaceButton.textContent = chooseWorkspaceResult.workspaceFileNameWithoutExtension;
                pickWorkspaceButton.title = chooseWorkspaceResult.workspaceFileAbsolutePath;
    
                EXPLORER_setChosenWorkspace(chooseWorkspaceResult);
                EXPLORER_treeViewComponent.resetTheUi();
            }
            break;
    }
}

async function EXPLORER_MenuOnClick(isCancelled, menuOption, menuRequest) {
    if (isCancelled || !menuOption) { return; }
    
    const commandKind = menuOption.commandKind;
    if (!commandKind) { return; }

    if (commandKind !== CommandKind.Cut && commandKind !== CommandKind.Paste) {
        EXPLORER_menuOptionCut_object = null;
    }

    if (!menuRequest.target.id) return;

    const entry = await window.myAPI.getFilesystemEntryById(menuRequest.target.id);
    if (!entry) return;

    switch (commandKind) {
        case CommandKind.Copy:
            await window.myAPI.setClipboard('file:///' + entry.absolutePath);
            break;
        case CommandKind.Cut:
            const text = 'file:///' + entry.absolutePath;
            EXPLORER_menuOptionCut_object = {
                id: text,
                indexItem: menuRequest.target.indexItem,
                divRelativeIndex: menuRequest.target.divRelativeIndex
            };
            await window.myAPI.setClipboard(text);
            break;
        case CommandKind.CopyAbsolutePath:
            await window.myAPI.setClipboard(entry.absolutePath);
            break;
        case CommandKind.Paste:
            await CommandKind.Paste_MenuOnClick_Paste(entry, menuRequest);
            break;
        case CommandKind.NewFile_Directory:
            await WIDGET_show(WidgetKind_InputText, f.fEXPLORER_menuOptionX, f.fEXPLORER_menuOptionY, 'filename', entry, menuRequest.target, menuRequest.elementToFocusOnCompleted, false, NewFile_Directory_WIDGET_InputText_callback);
            break;
        case CommandKind.NewFile_File:
            await WIDGET_show(WidgetKind_InputText, f.fEXPLORER_menuOptionX, f.fEXPLORER_menuOptionY, 'filename', entry, menuRequest.target, menuRequest.elementToFocusOnCompleted, false, NewFile_File_WIDGET_InputText_callback);
            break;
        case CommandKind.DeleteFile_Directory:
            await WIDGET_show(WidgetKind_YesCancel, f.fEXPLORER_menuOptionX, f.fEXPLORER_menuOptionY, 'delete ' + entry.basename, entry, menuRequest.target, menuRequest.elementToFocusOnCompleted, false, DeleteFile_Directory_YesCancel_callback);
            break;
        case CommandKind.DeleteFile_File:
            await WIDGET_show(WidgetKind_YesCancel, f.fEXPLORER_menuOptionX, f.fEXPLORER_menuOptionY, 'delete ' + entry.basename, entry, menuRequest.target, menuRequest.elementToFocusOnCompleted, false, DeleteFile_File_YesCancel_callback);
            break;
        case CommandKind.RenameFile_Directory:
            await WIDGET_show(WidgetKind_InputText, f.fEXPLORER_menuOptionX, f.fEXPLORER_menuOptionY, 'rename', entry.basename, {MENU_target:menuRequest.target, entry:entry}, menuRequest.elementToFocusOnCompleted, false, RenameFile_Directory_InputText_callback);
            break;
        case CommandKind.RenameFile_File:
            // TODO: Maybe the only difference between the _Directory and _File cases for each ..._... is the bool for isDirectory but I'm exhausted and I cannot reduce the code duplication here because my head doesn't function.
            await WIDGET_show(WidgetKind_InputText, f.fEXPLORER_menuOptionX, f.fEXPLORER_menuOptionY, 'rename', entry.basename, {MENU_target: menuRequest.target, entry: entry}, menuRequest.elementToFocusOnCompleted, false, RenameFile_File_InputText_callback);
            break;
    }
}

async function CommandKind_Paste_MenuOnClick_Paste(entry, menuRequest) {
    EXPLORER_treeViewNodes.getElementAt(menuRequest.target.indexItem);
    let nodeKind = f.byteTreeView_byteret_pooledNode_nodeKind;
    let depthOfTheParent = f.fTreeView_poolret_pooledNode_depth;
    let isCollapsed = nodeKind === TreeViewNodeKind.isExpandable_NOTisExpanded || nodeKind === TreeViewNodeKind.NOTisExpandable_NOTisExpanded;

    let local_EXPLORER_menuOptionCut_object = EXPLORER_menuOptionCut_object;
    EXPLORER_menuOptionCut_object = null;
    const pasteResult = await window.myAPI.pasteClipboardAbsolutePathToDirectory(entry.absolutePath, local_EXPLORER_menuOptionCut_object?.id);
    if (!pasteResult.success) { return; }

    // TODO: I belive this final paste logic that comes after this comment and within this scope is extremely similar to the new file logic...

    if (pasteResult.isDirectory) {
        nodeKind = TreeViewNodeKind.isExpandable_NOTisExpanded;
    }
    else {
        nodeKind = TreeViewNodeKind.NOTisExpandable_NOTisExpanded;
    }

    if (isCollapsed) { return; }
    
    let targetDepth = depthOfTheParent + 1;
    let someIndex = menuRequest.target.indexItem + 1;

    // TODO: 'i_targetDepth' is a bad variable name, you're looping a minimum of until 'pasteResult.indexOf' and each loop you check
    // whether that sibling is expanded, if so you skip all the children of the sibling.
    //
    for (let i_targetDepth = 0; i_targetDepth < pasteResult.indexOf; i_targetDepth++) {
        EXPLORER_treeViewNodes.getElementAt(someIndex);
        let nodeKind = f.byteTreeView_byteret_pooledNode_nodeKind;
        let isCollapsed = nodeKind === TreeViewNodeKind.isExpandable_NOTisExpanded || nodeKind === TreeViewNodeKind.NOTisExpandable_NOTisExpanded;

        let d_of_presumed_correct_depth = f.fTreeView_poolret_pooledNode_depth;
        if (d_of_presumed_correct_depth !== targetDepth) {
            // Validate the target you paste into's child count
            break;
        }

        someIndex++;

        if (!isCollapsed) {
            while (someIndex < EXPLORER_treeViewNodes.count_abstract) {
                let d_of_perhaps_too_large_depth = EXPLORER_treeViewNodes.getDepth(someIndex);
                if (d_of_perhaps_too_large_depth > targetDepth) {
                    someIndex++;
                }
                else {
                    break;
                }
                // TODO: Check if depth is less than targetDepth? This would only happen if the tree view were somehow in an incorrect state.
            }
        }

        // TODO: You're missing a 'someIndex < EXPLORER_treeViewNodes.count_abstract' check for after the while loop.
    }

    EXPLORER_treeViewNodes.insert(someIndex, nodeKind, pasteResult.pathId, menuRequest.target.depth + 1);

    if (pasteResult.sourceFileWasDeleted) {
        let indexItem = local_EXPLORER_menuOptionCut_object.indexItem;

        // TODO: clear 'EXPLORER_menuOptionCut_object' if paste clear flag cut if not same id

        if (someIndex <= indexItem) {
            indexItem += 1;
        }

        if (pasteResult.isDirectory) {
            let countChanges = EXPLORER_removeFromNodeList(indexItem);
        }
        else {
            EXPLORER_treeViewNodes.removeAt(indexItem, 1);
        }
    }

    f.fEXPLORER_itemHeightTotal = EXPLORER_treeViewNodes.count_abstract * f.fEXPLORER_itemHeightNumber;
    EXPLORER_scrollbar_space_generator.style.height = f.fEXPLORER_itemHeightTotal + 'px';
    EXPLORER_draw_BATCH_request(f.fEXPLORER_virtualIndex_ofScrollTop, f.fEXPLORER_virtualCount, 3);
}

async function NewFile_Directory_WIDGET_InputText_callback(widgetResult) {
    if (widgetResult.isCancelled) return;

    const entry = widgetResult.request.value;
    const target = widgetResult.request.target;

    EXPLORER_treeViewNodes.getElementAt(target.indexItem);
    let nodeKind = f.byteTreeView_byteret_pooledNode_nodeKind;
    let depthOfTheParent = f.fTreeView_poolret_pooledNode_depth;
    let isCollapsed = nodeKind === TreeViewNodeKind.isExpandable_NOTisExpanded || nodeKind === TreeViewNodeKind.NOTisExpandable_NOTisExpanded;

    const newFileResult = await window.myAPI.newFile(entry.absolutePath, widgetResult.resultData, /*isDirectory*/ true);
    if (!newFileResult.success) { return; }

    // TODO: I belive this final new directory logic that comes after this comment and within this scope is 1 to 1 an exact duplication of the new file logic...
    
    nodeKind = TreeViewNodeKind.isExpandable_NOTisExpanded;

    if (!isCollapsed) {

        let targetDepth = depthOfTheParent + 1;
        let someIndex = target.indexItem + 1;

        // TODO: 'i_targetDepth' is a bad variable name, you're looping a minimum of until 'newFileResult.indexOf' and each loop you check
        // whether that sibling is expanded, if so you skip all the children of the sibling.
        //
        for (let i_targetDepth = 0; i_targetDepth < newFileResult.indexOf; i_targetDepth++) {
            EXPLORER_treeViewNodes.getElementAt(someIndex);
            let nodeKind = f.byteTreeView_byteret_pooledNode_nodeKind;
            let isCollapsed = nodeKind === TreeViewNodeKind.isExpandable_NOTisExpanded || nodeKind === TreeViewNodeKind.NOTisExpandable_NOTisExpanded;

            let d_of_presumed_correct_depth = f.fTreeView_poolret_pooledNode_depth;
            if (d_of_presumed_correct_depth !== targetDepth) {
                // Validate the target you paste into's child count
                break;
            }

            someIndex++;

            if (!isCollapsed) {
                while (someIndex < EXPLORER_treeViewNodes.count_abstract) {
                    let d_of_perhaps_too_large_depth = EXPLORER_treeViewNodes.getDepth(someIndex);
                    if (d_of_perhaps_too_large_depth > targetDepth) {
                        someIndex++;
                    }
                    else {
                        break;
                    }
                    // TODO: Check if depth is less than targetDepth? This would only happen if the tree view were somehow in an incorrect state.
                }
            }

            // TODO: You're missing a 'someIndex < EXPLORER_treeViewNodes.count_abstract' check for after the while loop.
        }

        EXPLORER_treeViewNodes.insert(someIndex, nodeKind, newFileResult.pathId, target.depth + 1);

        f.fEXPLORER_itemHeightTotal = EXPLORER_treeViewNodes.count_abstract * f.fEXPLORER_itemHeightNumber;
        EXPLORER_scrollbar_space_generator.style.height = f.fEXPLORER_itemHeightTotal + 'px';
        EXPLORER_draw_BATCH_request(f.fEXPLORER_virtualIndex_ofScrollTop, f.fEXPLORER_virtualCount, 3);
    }
}

async function NewFile_File_WIDGET_InputText_callback(widgetResult) {
    if (widgetResult.isCancelled) return;

    const entry = widgetResult.request.value;
    const target = widgetResult.request.target;
    
    EXPLORER_treeViewNodes.getElementAt(target.indexItem);
    let nodeKind = f.byteTreeView_byteret_pooledNode_nodeKind;
    let depthOfTheParent = f.fTreeView_poolret_pooledNode_depth;
    let isCollapsed = nodeKind === TreeViewNodeKind.isExpandable_NOTisExpanded || nodeKind === TreeViewNodeKind.NOTisExpandable_NOTisExpanded;

    const newFileResult = await window.myAPI.newFile(entry.absolutePath, widgetResult.resultData, /*isDirectory*/ false);
    if (!newFileResult.success) { return; }

    nodeKind = TreeViewNodeKind.NOTisExpandable_NOTisExpanded;

    if (isCollapsed) { return; }

    let targetDepth = depthOfTheParent + 1;
    let someIndex = target.indexItem + 1;

    // TODO: 'i_targetDepth' is a bad variable name, you're looping a minimum of until 'newFileResult.indexOf' and each loop you check
    // whether that sibling is expanded, if so you skip all the children of the sibling.
    //
    for (let i_targetDepth = 0; i_targetDepth < newFileResult.indexOf; i_targetDepth++) {
        EXPLORER_treeViewNodes.getElementAt(someIndex);
        let nodeKind = f.byteTreeView_byteret_pooledNode_nodeKind;
        let isCollapsed = nodeKind === TreeViewNodeKind.isExpandable_NOTisExpanded || nodeKind === TreeViewNodeKind.NOTisExpandable_NOTisExpanded;

        let d_of_presumed_correct_depth = f.fTreeView_poolret_pooledNode_depth;
        if (d_of_presumed_correct_depth !== targetDepth) {
            // Validate the target you paste into's child count
            break;
        }

        someIndex++;

        if (!isCollapsed) {
            while (someIndex < EXPLORER_treeViewNodes.count_abstract) {
                let d_of_perhaps_too_large_depth = EXPLORER_treeViewNodes.getDepth(someIndex);
                if (d_of_perhaps_too_large_depth > targetDepth) {
                    someIndex++;
                }
                else {
                    break;
                }
                // TODO: Check if depth is less than targetDepth? This would only happen if the tree view were somehow in an incorrect state.
            }
        }

        // TODO: You're missing a 'someIndex < EXPLORER_treeViewNodes.count_abstract' check for after the while loop.
    }

    EXPLORER_treeViewNodes.insert(someIndex, nodeKind, newFileResult.pathId, target.depth + 1);

    f.fEXPLORER_itemHeightTotal = EXPLORER_treeViewNodes.count_abstract * f.fEXPLORER_itemHeightNumber;
    EXPLORER_scrollbar_space_generator.style.height = f.fEXPLORER_itemHeightTotal + 'px';
    EXPLORER_draw_BATCH_request(f.fEXPLORER_virtualIndex_ofScrollTop, f.fEXPLORER_virtualCount, 3);
}

async function DeleteFile_Directory_YesCancel_callback(widgetResult) {
    if (widgetResult.isCancelled) return;
    const entry = widgetResult.request.value;
    const target = widgetResult.request.target;
    const deleteFileResult = await window.myAPI.deleteFile(entry.absolutePath, /*isDirectory*/ true);
    if (!deleteFileResult) { return; }

    let countChanges = EXPLORER_removeFromNodeList(target.indexItem);

    f.fEXPLORER_itemHeightTotal = EXPLORER_treeViewNodes.count_abstract * f.fEXPLORER_itemHeightNumber;
    EXPLORER_scrollbar_space_generator.style.height = f.fEXPLORER_itemHeightTotal + 'px';
    EXPLORER_draw_BATCH_request(f.fEXPLORER_virtualIndex_ofScrollTop, f.fEXPLORER_virtualCount, 3);
}

async function DeleteFile_File_YesCancel_callback(widgetResult) {
    if (widgetResult.isCancelled) return;
    const entry = widgetResult.request.value;
    const target = widgetResult.request.target;
    const deleteFileResult = await window.myAPI.deleteFile(entry.absolutePath, /*isDirectory*/ false);
    if (!deleteFileResult) { return; }

    EXPLORER_treeViewNodes.removeAt(target.indexItem, 1);

    f.fEXPLORER_itemHeightTotal = EXPLORER_treeViewNodes.count_abstract * f.fEXPLORER_itemHeightNumber;
    EXPLORER_scrollbar_space_generator.style.height = f.fEXPLORER_itemHeightTotal + 'px';
    EXPLORER_draw_BATCH_request(f.fEXPLORER_virtualIndex_ofScrollTop, f.fEXPLORER_virtualCount, 3);
}

async function RenameFile_Directory_InputText_callback(widgetResult) {
    if (widgetResult.isCancelled) return;
    // TODO: Confusing, hacky, upsetting: 'WIDGET_target.entry / WIDGET_target.MENU_target'
    const entry = widgetResult.request.target.entry;
    const target = widgetResult.request.target.MENU_target;
    const renameFileResult = await window.myAPI.renameFile(entry.absolutePath, widgetResult.resultData, /*isDirectory*/ true);
    if (!renameFileResult.success) { return; }

    EXPLORER_setNodeListEntryId(target.indexItem, renameFileResult.pathId);
    const textNode = EXPLORER_itemListElement.children[target.divRelativeIndex].firstChild;
    textNode.replaceData(1, textNode.length - 1, widgetResult.resultData);
}

async function RenameFile_File_InputText_callback(widgetResult) {
    if (widgetResult.isCancelled) return;
    // TODO: Confusing, hacky, upsetting: 'WIDGET_target.entry / WIDGET_target.MENU_target'
    const entry = widgetResult.request.target.entry;
    const target = widgetResult.request.target.MENU_target;
    const renameFileResult = await window.myAPI.renameFile(entry.absolutePath, widgetResult.resultData, /*isDirectory*/ false);
    if (!renameFileResult.success) { return; }

    EXPLORER_setNodeListEntryId(target.indexItem, renameFileResult.pathId);
    const textNode = EXPLORER_itemListElement.children[target.divRelativeIndex].firstChild;
    textNode.replaceData(1, textNode.length - 1, widgetResult.resultData);
}

// TODO: look at the "async" events because its nonsensical

// TODO: fine grained redrawing of only the nodes that are:
// - part of the virtualization result
// - and have changed in some way that necessitates their UI be redrawn

/*
// TODO: I saw the result was success but the indexOf was -1 when adding a file with the same name twice that seems erroneous...
// ...one such case of getting the -1 was due to not-awaited async file creation followed by reading the directory as a "sorting algorithm"-ish...
// ...cause you wanted to know where the OS put the new file among the existing children...
// ...I'm not sure whether the case I'm describing is what the original todo was describing and thus I'm not gonna get rid of the original todo...
// ...TODO: was the original todo referencing the case I described?

// TODO: I added 3 files total while testing various words that would alphabetically be placed at the start, end, or somewhere in the middle...
// ...I think the middle case for some reason ended up in the parent? I'm not quite sure what happened.
*/

// TODO: If menu is showing either:
// - don't let user scroll
// - when they do scroll close the menu
