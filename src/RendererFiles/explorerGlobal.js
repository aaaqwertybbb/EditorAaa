//__#__
// preprocessor.cjs
import "./fieldBuffer"
//__#__

/*
When collapse maybe you reset the length of the longest line or something

===

also need to update the width of the cursor to the largest width seen div thing so it visually looks correct
need to make sure the code does a min-width esque logic. Probably don't want the css but just for the code that sets the style to consider it for you avoids min-width overhead if exists?


NO ASYNC EVENTS
- higher likelihood of memory leaking PerformanceEventTiming due to inability for browser to clear buffer on time requiring manual clearing of the long term buffer.
*/

/**
 * @type {TreeViewComponent_v2}
 */
const treeViewComponent_v2_debug = new TreeViewComponent_v2(16, treeViewComponent_v2_staticRunner, Debug_treeViewComponent_v2_renderLines, Debug_treeViewComponent_v2_expandCollapseIconWasClicked, Debug_treeViewComponent_v2_dblClick_or_space_or_enter);
// treeViewComponent_v2_debug.initialize(dialogBody, null /*beforeChild*/);
let treeViewComponent_v2_debug_stringsMapByPathId = new Map();

treeViewComponent_v2_debug.initialize(document.getElementById('EXPLORER'), null);

let EXPLORER_itemHeightStyleAttributeValueString = '20px';

let EXPLORER_SET_ITEMS_itemHeightStyleAttributeValueString = '';

/////
///// end treeViewComponent.js
/////

/** // Invoke this?: 'this.draw_render_fullReset_request();' */
function EXPLORER_setChosenDirectory(chosenDirectoryAbsolutePath, chosenDirectoryBasename, chosenDirectoryAbsolutePathId) {
    treeViewComponent_v2_debug_stringsMapByPathId.clear();
    if (!chosenDirectoryAbsolutePath) return;

    treeViewComponent_v2_debug.insert(treeViewComponent_v2_debug.countAbstract, TreeViewNodeKind_isExpandable_NOTisExpanded, chosenDirectoryAbsolutePathId, 0);
    treeViewComponent_v2_debug_stringsMapByPathId.set(chosenDirectoryAbsolutePathId, chosenDirectoryBasename);
}

/** // Invoke this?: 'this.draw_render_fullReset_request();' */
function EXPLORER_setChosenWorkspace(chooseWorkspaceResult) {
    treeViewComponent_v2_debug_stringsMapByPathId.clear();
    if (!chooseWorkspaceResult.workspaceFileAbsolutePath) return;

    if (chooseWorkspaceResult.workspaceFileAbsolutePath === "C:\\Users\\hunte\\Repos\\New folder (7)\\Editor2.code-workspace") {
        // enable experimental behavior only if the path matches my own.
        // This is not 100% fool proof but for my temporary use case it is likely 100% secure
        // given the extremely small amount of people running the code i.e.: maybe I'm the only one that even runs this code I don't know.
        // Nevertheless for this sample size this statistically I imagine approaches 100% security.
        shouldUseCSharpToSaveFileWhenPossible = true;
    }

    for (let i = 0; i < chooseWorkspaceResult.directories.length; i++) {
        const directory = chooseWorkspaceResult.directories[i];
        treeViewComponent_v2_debug.insert(treeViewComponent_v2_debug.countAbstract, TreeViewNodeKind_isExpandable_NOTisExpanded, directory.id, 0);
        treeViewComponent_v2_debug_stringsMapByPathId.set(directory.id, directory.basename);
    }
}

function EXPLORER_oncontextmenu(divItem, indexItem, event_button, event_clientX, event_clientY, relativeIndex) {
    let optionList = [
        MENU_MenuOption_factory(CommandKind_Copy, 'Copy'),
        MENU_MenuOption_factory(CommandKind_CopyAbsolutePath, 'Copy Absolute Path'),
    ];

    EXPLORER_ensure_boundingClientRect();

    // TODO: !!!! You might need to be careful with async and the TreeView_pooledNode; I'm not certain whether you do or don't have to be careful, and I don't feel like looking into it at the moment.
    EXPLORER_treeViewNodes.getElementAt(indexItem);
    let key = INTS[fTreeView_poolret_pooledNode_key];
    let depth = INTS[fTreeView_poolret_pooledNode_depth];
    let nodeKind = BYTES[byteTreeView_byteret_pooledNode_nodeKind];

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
        left = INTS[fEXPLORER_menuOptionX] = event_clientX;
        top = INTS[fEXPLORER_menuOptionY] = event_clientY;
    }
    else {
        EXPLORER_addSpecificMenuOptionsForTarget(optionList, divItem, target);
        left = INTS[fEXPLORER_menuOptionX]=INTS[fEXPLORER_boundingClientRect_left];
        top = INTS[fEXPLORER_menuOptionY] = (INTS[fEXPLORER_boundingClientRect_top] + ((INTS[fEXPLORER_cursorIndex] + 1) * INTS[fEXPLORER_itemHeightNumber]) - INTS[fEXPLORER_lastReadNumber_scrollTop]);
    }

    menuSet(optionList, left, top, EXPLORER_MenuOnClick, target, /*elementToFocusOnCompleted*/ null, /*disableFocusOnCompleted*/ false, /*index*/ 0);
}

/**
 * TODO: To detect whether the "expand/collapse icon" was clicked, the logic 'if(event.target === nodeElement.children[0])' is used...
 * ...this logic is flawed if one ever were to put an element within the span that became the target...
 * ...thus, you should consider checking the x position of the event against the x position of the nodeElement.children[0].
 * @param {*} event 
 */
async function EXPLORER_expandCollapseIconWasClicked(divItem, indexItem, ringBufferIndexItem) {
    // TODO: !!!! You might need to be careful with async and the TreeView_pooledNode; I'm not certain whether you do or don't have to be careful, and I don't feel like looking into it at the moment.
    EXPLORER_treeViewNodes.getElementAt(indexItem);
    const key = INTS[fTreeView_poolret_pooledNode_key];
    const depth = INTS[fTreeView_poolret_pooledNode_depth];
    const nodeKind = BYTES[byteTreeView_byteret_pooledNode_nodeKind];

    // It isn't fully working
    // I got a case to break when I collapsed while scroll top > 0
    // and then the collapse causes a scroll at the same time I click the chevron.
    //
    // I think specifically the collapse has to make the content smaller than "scrollHeight?"
    // and then the browser forces scroll top to 0 as a result.
    //
    // I'll put scrollHeight in quotes cause I'm iffy on whether I wanna say scrollHeight or the viewable height of the UI in question or like
    // idk I'm tired but that's what I can confirm isn't working.

    if (nodeKind === TreeViewNodeKind_isExpandable_NOTisExpanded) {

        divItem.firstChild.replaceData(0, 1, '-');
        EXPLORER_treeViewNodes.setNodeKind(indexItem, TreeViewNodeKind_isExpandable_isExpanded);

        const childFilesystemEntries = await window.myAPI.getFilesystemEntries_argumentIsId(key);
        const insertionCount = childFilesystemEntries.length;
        if (insertionCount === 0) { return; }

        for (let i = 0; i < insertionCount; i++) {
            const entry = childFilesystemEntries[i];
            const nodeKind = entry.isDirectory
                ? TreeViewNodeKind_isExpandable_NOTisExpanded
                : TreeViewNodeKind_NOTisExpandable_NOTisExpanded;
            // TODO: Insert range, or at the least 'pre-emptively' resize the list so that it fits each insertion without resizing per insertion.
            EXPLORER_treeViewNodes.insert(indexItem + 1 + i, nodeKind, entry.id, depth + 1);
        }

        INTS[fEXPLORER_itemHeightTotal] = EXPLORER_treeViewNodes.count_abstract * INTS[fEXPLORER_itemHeightNumber];
        EXPLORER_scrollbar_space_generator.style.height = INTS[fEXPLORER_itemHeightTotal] + 'px';

        const final_ringBufferIndexItem = get_final_ringBufferIndexItem();

        // This case doesn't make sense, it means the virtualCount === 0
        if (final_ringBufferIndexItem < 0) { EXPLORER_draw_render_fullReset_request(); return; }
        // you can just "do nothing" so to speak (you need to "update the scrollbar" still / etc...) and you've already "update the scrollbar"ed so you just return.
        if (ringBufferIndexItem === final_ringBufferIndexItem) { return; }

        // If insertion count completely shifts visible TreeViewNodes that exist under the expanded TreeViewNode off screen you can just redraw every node below the one that was expanded.
        // TODO: determine a more optimized way to calculate this than just looping over and over.
        let availableRingBufferNodesVisuallyAfterExpandedOne = 0;
        for (let n_index = ringBufferIndexItem;;) {
            availableRingBufferNodesVisuallyAfterExpandedOne++;
            n_index = n_index + 1;
            if (n_index >= INTS[fEXPLORER_virtualCount]) {
                n_index -= INTS[fEXPLORER_virtualCount];
            }
            if (n_index === final_ringBufferIndexItem) {
                break;
            }
        }

        const next_ringBufferIndex = ringBufferIndexItem + 1;
        if (next_ringBufferIndex >= INTS[fEXPLORER_virtualCount]) {
            next_ringBufferIndex -= INTS[fEXPLORER_virtualCount];
        }

        if (insertionCount >= availableRingBufferNodesVisuallyAfterExpandedOne) {
            EXPLORER_draw_BATCH_request(indexItem + 1, availableRingBufferNodesVisuallyAfterExpandedOne, 3, next_ringBufferIndex);
        }
        else {
            const final_indexItem = indexItem + availableRingBufferNodesVisuallyAfterExpandedOne; // TODO: This is a weird way to get the 'final_indexItem'
            handleRingBufferNodesThatAreOffscreen_expand(final_ringBufferIndexItem, final_indexItem, indexItem, ringBufferIndexItem, insertionCount);
            EXPLORER_draw_BATCH_request(indexItem + 1, insertionCount, 3, next_ringBufferIndex);
        }
    }
    else if (nodeKind === TreeViewNodeKind_isExpandable_isExpanded) {

        divItem.firstChild.replaceData(0, 1, '+');
        EXPLORER_treeViewNodes.setNodeKind(indexItem, TreeViewNodeKind_isExpandable_NOTisExpanded);

        let countChildren = 0;
        for (let i = indexItem + 1; i < EXPLORER_treeViewNodes.count_abstract; i++) {
            // If currentDepth < ithElementDepth; // then current is a parent of ithElement.
            if (depth < EXPLORER_treeViewNodes.getDepth(i)) {
                countChildren++;
            }
            else {
                break;
            }
        }

        if (countChildren === 0) { return; }

        EXPLORER_treeViewNodes.removeAt(indexItem + 1, countChildren);
        INTS[fEXPLORER_itemHeightTotal] = EXPLORER_treeViewNodes.count_abstract * INTS[fEXPLORER_itemHeightNumber];
        EXPLORER_scrollbar_space_generator.style.height = INTS[fEXPLORER_itemHeightTotal] + 'px';

        const final_ringBufferIndexItem = get_final_ringBufferIndexItem();

        // This case doesn't make sense, it means the virtualCount === 0
        if (final_ringBufferIndexItem < 0) { EXPLORER_draw_render_fullReset_request(); return; }
        // you can just "do nothing" so to speak (you need to "update the scrollbar" still / etc...) and you've already "update the scrollbar"ed so you just return.
        if (ringBufferIndexItem === final_ringBufferIndexItem) { return; }

        let availableRingBufferNodesVisuallyAfterCollapsedOne = 0;
        for (let n_index = ringBufferIndexItem;;) {
            availableRingBufferNodesVisuallyAfterCollapsedOne++;
            n_index = n_index + 1;
            if (n_index >= INTS[fEXPLORER_virtualCount]) {
                n_index -= INTS[fEXPLORER_virtualCount];
            }
            if (n_index === final_ringBufferIndexItem) {
                break;
            }
        }

        if (countChildren >= availableRingBufferNodesVisuallyAfterCollapsedOne) {
            const next_ringBufferIndex = ringBufferIndexItem + 1;
            if (next_ringBufferIndex >= INTS[fEXPLORER_virtualCount]) {
                next_ringBufferIndex -= INTS[fEXPLORER_virtualCount];
            }

            EXPLORER_draw_BATCH_request(indexItem + 1, availableRingBufferNodesVisuallyAfterCollapsedOne, 3, next_ringBufferIndex);
        }
        else {
            handleRingBufferNodesThatAreOffscreen_collapse(final_ringBufferIndexItem, indexItem, ringBufferIndexItem, countChildren, availableRingBufferNodesVisuallyAfterCollapsedOne);

            let recycled_itemIndex = indexItem;
            let recycled_ringBufferIndex = ringBufferIndexItem;
            const displaced_count = availableRingBufferNodesVisuallyAfterCollapsedOne - countChildren;
            // TODO: calculate the earliest displaced node faster than just "looping a minus 1 over and over"
            for (let i = 0; i < (displaced_count + 1); i++) {
                recycled_itemIndex++;
                recycled_ringBufferIndex++;
                if (recycled_ringBufferIndex >= INTS[fEXPLORER_virtualCount]) {
                    recycled_ringBufferIndex -= INTS[fEXPLORER_virtualCount];
                }
            }

            EXPLORER_draw_BATCH_request(recycled_itemIndex, countChildren, 3, recycled_ringBufferIndex);
        }
    }
}

function handleRingBufferNodesThatAreOffscreen_collapse(final_ringBufferIndex, indexItem_of_collapsed_node, ringBufferIndex_of_collapsed_node, recycleCount, availableRingBufferNodesVisuallyAfterCollapsedOne) {
    let displaced_itemIndex = indexItem_of_collapsed_node;
    let displaced_ringBufferIndex = ringBufferIndex_of_collapsed_node;
    // TODO: calculate the earliest displaced node faster than just "looping a minus 1 over and over"
    for (let i = 0; i < (recycleCount + 1); i++) {
        displaced_itemIndex++;
        displaced_ringBufferIndex++;
        if (displaced_ringBufferIndex >= INTS[fEXPLORER_virtualCount]) {
            displaced_ringBufferIndex -= INTS[fEXPLORER_virtualCount];
        }
    }

    let recycle_itemIndex = indexItem_of_collapsed_node + 1;
    let recycle_ringBufferIndex = ringBufferIndex_of_collapsed_node + 1;
    if (recycle_ringBufferIndex >= INTS[fEXPLORER_virtualCount]) {
        recycle_ringBufferIndex -= INTS[fEXPLORER_virtualCount]
    }

    // 3. Perform a block rotation via triple-reversal 
    // This repositions all 'recycle(s)' and 'displaced(s)' in O(N) operations total, discarding the nested loops
    
    const inclusive_earliest_recycle_ringBufferIndex = recycle_ringBufferIndex;

    const end_of_recycle_block = displaced_ringBufferIndex - 1;
    if (end_of_recycle_block < 0) {
        end_of_recycle_block = INTS[fEXPLORER_virtualCount] - 1;
    }

    const endOfDisplacedBlock = final_ringBufferIndex;

    EXPLORER_reverseBufferSegment(inclusive_earliest_recycle_ringBufferIndex, end_of_recycle_block); // Reverse Recycle(s)
    EXPLORER_reverseBufferSegment(displaced_ringBufferIndex, endOfDisplacedBlock);                   // Reverse Displaced(s)
    EXPLORER_reverseBufferSegment(recycle_ringBufferIndex, endOfDisplacedBlock);                     // Reverse entire window

    // The 'recycles' will be drawn with their text, depth, and translateY immediately after this function so you can skip them.
    // Since everything was reversed in earlier steps this is the way to do exactly that.
    displaced_ringBufferIndex = recycle_ringBufferIndex;
    displaced_itemIndex = recycle_itemIndex;

    const displacedCount = availableRingBufferNodesVisuallyAfterCollapsedOne - recycleCount;

    for (let i = 0; i < displacedCount; i++) {
        let depth = 0;
        if (displaced_itemIndex < EXPLORER_treeViewNodes.count_abstract) {
            depth = EXPLORER_treeViewNodes.getDepth(displaced_itemIndex);
        }

        EXPLORER_ringBuffer[displaced_ringBufferIndex].style.transform = `translate(${CONST_EXPLORER_offsetPerDepth * depth}px, ${INTS[fEXPLORER_itemHeightNumber] * displaced_itemIndex}px)`;

        displaced_itemIndex++;

        displaced_ringBufferIndex++;
        if (displaced_ringBufferIndex >= INTS[fEXPLORER_virtualCount]) {
            displaced_ringBufferIndex -= INTS[fEXPLORER_virtualCount]
        }
    }
}

function handleRingBufferNodesThatAreOffscreen_expand(final_ringBufferIndex, final_indexItem, indexItem_of_expanded_node, ringBufferIndex_of_expanded_node, recycleCount) {
    let displaced_itemIndex = indexItem_of_expanded_node + 1;
    let displaced_ringBufferIndex = ringBufferIndex_of_expanded_node + 1;
    if (displaced_ringBufferIndex >= INTS[fEXPLORER_virtualCount]) {
        displaced_ringBufferIndex -= INTS[fEXPLORER_virtualCount];
    }

    // TODO: calculate the earliest recycled node faster than just "looping a minus 1 over and over"
    let recycle_itemIndex = final_indexItem;
    let recycle_ringBufferIndex = final_ringBufferIndex;
    for (let i = 1/* start at 1 so you skip a loop */; i < recycleCount; i++) {
        recycle_itemIndex--;
        recycle_ringBufferIndex--;
        if (recycle_ringBufferIndex < 0) {
            recycle_ringBufferIndex = INTS[fEXPLORER_virtualCount] - 1;
        }
    }

    const inclusive_earliest_recycle_ringBufferIndex = recycle_ringBufferIndex;

    // 3. Perform a block rotation via triple-reversal 
    // This repositions all 'displaced(s)' and 'recycle(s)' in O(N) operations total, discarding the nested loops
    const end_of_recycle_block = final_ringBufferIndex;
    
    const endOfDisplacedBlock = inclusive_earliest_recycle_ringBufferIndex - 1;
    if (endOfDisplacedBlock < 0) {
        endOfDisplacedBlock = INTS[fEXPLORER_virtualCount] - 1;
    }

    EXPLORER_reverseBufferSegment(displaced_ringBufferIndex, endOfDisplacedBlock);                   // Reverse Displaced(s)
    EXPLORER_reverseBufferSegment(inclusive_earliest_recycle_ringBufferIndex, end_of_recycle_block); // Reverse Recycle(s)
    EXPLORER_reverseBufferSegment(displaced_ringBufferIndex, end_of_recycle_block);                  // Reverse entire window

    // The 'recycles' will be drawn with their text, depth, and translateY immediately after this function so you can skip them.
    // Since everything was reversed in earlier steps this is the way to do exactly that.
    for (let i = 0; i < recycleCount; i++) {
        displaced_ringBufferIndex++;
        if (displaced_ringBufferIndex >= INTS[fEXPLORER_virtualCount]) {
            displaced_ringBufferIndex -= INTS[fEXPLORER_virtualCount]
        }
        displaced_itemIndex++;
    }

    for (;;) {
        let depth = 0;
        if (displaced_itemIndex < EXPLORER_treeViewNodes.count_abstract) {
            depth = EXPLORER_treeViewNodes.getDepth(displaced_itemIndex);
        }

        EXPLORER_ringBuffer[displaced_ringBufferIndex].style.transform = `translate(${CONST_EXPLORER_offsetPerDepth * depth}px, ${INTS[fEXPLORER_itemHeightNumber] * displaced_itemIndex}px)`;

        if (displaced_ringBufferIndex === final_ringBufferIndex) {
            break;
        }

        displaced_itemIndex++;

        displaced_ringBufferIndex++;
        if (displaced_ringBufferIndex >= INTS[fEXPLORER_virtualCount]) {
            displaced_ringBufferIndex -= INTS[fEXPLORER_virtualCount]
        }
    }
}

// Helper to reverse a segment inside the ring buffer in-place
// This allows us to perform block rotations without element-by-element shifting loops
function EXPLORER_reverseBufferSegment(start, end) {
    let left = start;
    let right = end;
    while (left !== right) {
        const temp = EXPLORER_ringBuffer[left];
        EXPLORER_ringBuffer[left] = EXPLORER_ringBuffer[right];
        EXPLORER_ringBuffer[right] = temp;

        if (left === right) break;
        left++;
        if (left >= INTS[fEXPLORER_virtualCount]) {
            left -= INTS[fEXPLORER_virtualCount]
        }

        if (left === right) break;
        right--;
        if (right < 0) {
            right = INTS[fEXPLORER_virtualCount] - 1;
        }
    }
}

function get_final_ringBufferIndexItem() {
    // See comment "Awkward explicit inlining of 'EXPLORER_indexItemTo_ringBufferIndexItem'" for more information.
    let final_ringBufferIndexItem = INTS[fEXPLORER_virtualCount] - 1;
    if (final_ringBufferIndexItem >= INTS[fEXPLORER_ringBuffer_length] || final_ringBufferIndexItem < 0) final_ringBufferIndexItem = -1;
    else final_ringBufferIndexItem = (final_ringBufferIndexItem + INTS[fEXPLORER_ringBufferIndexZero]) % INTS[fEXPLORER_virtualCount];
    if (final_ringBufferIndexItem < 0) { return -1; }

    return final_ringBufferIndexItem;
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
    let depth = INTS[fTreeView_poolret_pooledNode_depth];
    let nodeKind = BYTES[byteTreeView_byteret_pooledNode_nodeKind];

    if (nodeKind === TreeViewNodeKind_NOTisExpandable_isExpanded) {
        alert("TODO: if (nodeKind === ...TreeViewNodeKind_NOTisExpandable_isExpanded())");
        return;
    }

    let countChildren = 0;

    if (nodeKind === TreeViewNodeKind_isExpandable_isExpanded) {
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
    INTS[fEXPLORER_itemHeightTotal] = EXPLORER_treeViewNodes.count_abstract * INTS[fEXPLORER_itemHeightNumber];
    EXPLORER_scrollbar_space_generator.style.height = INTS[fEXPLORER_itemHeightTotal] + 'px';
    return 1 + countChildren;
}

/** TODO: any usage of this needs to respect the actual zeroth UI div not the literal. */
function EXPLORER_setNodeListEntryId(indexItem, pathId) {
    EXPLORER_treeViewNodes.setKey(indexItem, pathId);
}

function EXPLORER_addSpecificMenuOptionsForTarget(optionList, divItem, target) {
    if (!divItem) return;

    // check the "text icon": { '-', '+', '' }
    if (target.nodeKind === TreeViewNodeKind_isExpandable_isExpanded ||
        target.nodeKind === TreeViewNodeKind_isExpandable_NOTisExpanded) {
        
        // Directory
        optionList.push(MENU_MenuOption_factory(CommandKind_NewFile_File, 'NewFile'));
        optionList.push(MENU_MenuOption_factory(CommandKind_NewFile_Directory, 'NewDirectory'));
        optionList.push(MENU_MenuOption_factory(CommandKind_DeleteFile_Directory, 'Delete'));
        optionList.push(MENU_MenuOption_factory(CommandKind_RenameFile_Directory, 'Rename'));
        optionList.push(MENU_MenuOption_factory(CommandKind_Paste, 'Paste'));
        optionList.push(MENU_MenuOption_factory(CommandKind_Cut, 'Cut'));
    }
    else {
        // File
        optionList.push(MENU_MenuOption_factory(CommandKind_DeleteFile_File, 'Delete'));
        optionList.push(MENU_MenuOption_factory(CommandKind_RenameFile_File, 'Rename'));
        optionList.push(MENU_MenuOption_factory(CommandKind_Cut, 'Cut'));
    }
}

function EXPLORER_event_contextmenu(event) {
    const event_button = event.button;
    const event_clientX = event.clientX;
    const event_clientY = event.clientY;

    EXPLORER_ensure_boundingClientRect();

    if (event_button === 2) {
        const rY = event_clientY - INTS[fEXPLORER_boundingClientRect_top] + INTS[fEXPLORER_lastReadNumber_scrollTop];

        EXPLORER_state_cursor_setIndex(EXPLORER_state_cursor_validateIndex(
            Math.floor(rY / INTS[fEXPLORER_itemHeightNumber])));

        // TODO: you need to move this above the divItem assignment and do checks earlier... double check all other uses

        // See comment "Awkward explicit inlining of 'EXPLORER_indexItemTo_ringBufferIndexItem'" for more information.
        let ringBufferIndexItem = ((INTS[fEXPLORER_cursorIndex])) - INTS[fEXPLORER_virtualIndex_ofScrollTop];
        if (ringBufferIndexItem >= INTS[fEXPLORER_ringBuffer_length] || ringBufferIndexItem < 0) ringBufferIndexItem = -1;
        else ringBufferIndexItem = (ringBufferIndexItem + INTS[fEXPLORER_ringBufferIndexZero]) % INTS[fEXPLORER_virtualCount];
        if (ringBufferIndexItem < 0) return;

        EXPLORER_oncontextmenu(EXPLORER_ringBuffer[ringBufferIndexItem], INTS[fEXPLORER_cursorIndex], event_button, event_clientX, event_clientY, ringBufferIndexItem);
    }
    else {
        if (INTS[fEXPLORER_cursorIndex] >= EXPLORER_treeViewNodes.count_abstract) {
            return;
        }

        EXPLORER_state_cursor_setIndex(EXPLORER_state_cursor_validateIndex(
            INTS[fEXPLORER_cursorIndex]));

        // See comment "Awkward explicit inlining of 'EXPLORER_indexItemTo_ringBufferIndexItem'" for more information.
        let ringBufferIndexItem = ((INTS[fEXPLORER_cursorIndex])) - INTS[fEXPLORER_virtualIndex_ofScrollTop];
        if (ringBufferIndexItem >= INTS[fEXPLORER_ringBuffer_length] || ringBufferIndexItem < 0) ringBufferIndexItem = -1;
        else ringBufferIndexItem = (ringBufferIndexItem + INTS[fEXPLORER_ringBufferIndexZero]) % INTS[fEXPLORER_virtualCount];
        if (ringBufferIndexItem < 0) return;

        // TODO: Handle context menu with keyboard when active node is out of view
        EXPLORER_oncontextmenu(EXPLORER_ringBuffer[ringBufferIndexItem], INTS[fEXPLORER_cursorIndex], event_button, event_clientX, event_clientY, ringBufferIndexItem);
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
let EXPLORER_firstSpanWidth = '8px';

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
toggleShowExplorerButton.checked = BYTES[byteEXPLORER_show];
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
        MENU_MenuOption_factory(CommandKind_SelectFolder, 'Folder'),
        MENU_MenuOption_factory(CommandKind_SelectWorkspace, 'Workspace'),
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

	if (shouldShow && !BYTES[byteEXPLORER_show]) {
		let editorHackElement = document.getElementById('EDI_hack');
		EXPLORER_Element.style.width = '200px';
		EXPLORER_Element.style.visibility = '';
		editorHackElement.style.width = 'calc(100% - 200px)';
		BYTES[byteEXPLORER_show] = shouldShow;
		let toggleShowExplorerButton = document.getElementById('HEADER_toggleShowExplorer');
		toggleShowExplorerButton.checked = BYTES[byteEXPLORER_show];
		EDI_onResize();
	}
	else if (!shouldShow && BYTES[byteEXPLORER_show]) {
		// !show is redundant, but exists for readability.
		let editorHackElement = document.getElementById('EDI_hack');
		EXPLORER_Element.style.width = '0px';
		EXPLORER_Element.style.visibility = 'hidden';
		editorHackElement.style.width = '100%';
		BYTES[byteEXPLORER_show] = shouldShow;
		let toggleShowExplorerButton = document.getElementById('HEADER_toggleShowExplorer');
		toggleShowExplorerButton.checked = BYTES[byteEXPLORER_show];
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
        case CommandKind_SelectFolder:
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
                treeViewComponent_v2_debug.resetTheUi();
            }
            break;
        case CommandKind_SelectWorkspace:
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
                treeViewComponent_v2_debug.resetTheUi();
            }
            break;
    }
}

async function EXPLORER_MenuOnClick(isCancelled, menuOption, menuRequest) {
    if (isCancelled || !menuOption) { return; }
    
    const commandKind = menuOption.commandKind;
    if (!commandKind) { return; }

    if (commandKind !== CommandKind_Cut && commandKind !== CommandKind_Paste) {
        EXPLORER_menuOptionCut_object = null;
    }

    if (!menuRequest.target.id) return;

    const entry = await window.myAPI.getFilesystemEntryById(menuRequest.target.id);
    if (!entry) return;

    switch (commandKind) {
        case CommandKind_Copy:
            await window.myAPI.setClipboard('file:///' + entry.absolutePath);
            break;
        case CommandKind_Cut:
            const text = 'file:///' + entry.absolutePath;
            EXPLORER_menuOptionCut_object = {
                id: text,
                indexItem: menuRequest.target.indexItem,
                divRelativeIndex: menuRequest.target.divRelativeIndex
            };
            await window.myAPI.setClipboard(text);
            break;
        case CommandKind_CopyAbsolutePath:
            await window.myAPI.setClipboard(entry.absolutePath);
            break;
        case CommandKind_Paste:
            await CommandKind_Paste_MenuOnClick_Paste(entry, menuRequest);
            break;
        case CommandKind_NewFile_Directory:
            await WIDGET_show(WidgetKind_InputText, INTS[fEXPLORER_menuOptionX], INTS[fEXPLORER_menuOptionY], 'filename', entry, menuRequest.target, menuRequest.elementToFocusOnCompleted, false, NewFile_Directory_WIDGET_InputText_callback);
            break;
        case CommandKind_NewFile_File:
            await WIDGET_show(WidgetKind_InputText, INTS[fEXPLORER_menuOptionX], INTS[fEXPLORER_menuOptionY], 'filename', entry, menuRequest.target, menuRequest.elementToFocusOnCompleted, false, NewFile_File_WIDGET_InputText_callback);
            break;
        case CommandKind_DeleteFile_Directory:
            await WIDGET_show(WidgetKind_YesCancel, INTS[fEXPLORER_menuOptionX], INTS[fEXPLORER_menuOptionY], 'delete ' + entry.basename, entry, menuRequest.target, menuRequest.elementToFocusOnCompleted, false, DeleteFile_Directory_YesCancel_callback);
            break;
        case CommandKind_DeleteFile_File:
            await WIDGET_show(WidgetKind_YesCancel, INTS[fEXPLORER_menuOptionX], INTS[fEXPLORER_menuOptionY], 'delete ' + entry.basename, entry, menuRequest.target, menuRequest.elementToFocusOnCompleted, false, DeleteFile_File_YesCancel_callback);
            break;
        case CommandKind_RenameFile_Directory:
            await WIDGET_show(WidgetKind_InputText, INTS[fEXPLORER_menuOptionX], INTS[fEXPLORER_menuOptionY], 'rename', entry.basename, {MENU_target:menuRequest.target, entry:entry}, menuRequest.elementToFocusOnCompleted, false, RenameFile_Directory_InputText_callback);
            break;
        case CommandKind_RenameFile_File:
            // TODO: Maybe the only difference between the _Directory and _File cases for each ..._... is the bool for isDirectory but I'm exhausted and I cannot reduce the code duplication here because my head doesn't function.
            await WIDGET_show(WidgetKind_InputText, INTS[fEXPLORER_menuOptionX], INTS[fEXPLORER_menuOptionY], 'rename', entry.basename, {MENU_target: menuRequest.target, entry: entry}, menuRequest.elementToFocusOnCompleted, false, RenameFile_File_InputText_callback);
            break;
    }
}

async function CommandKind_Paste_MenuOnClick_Paste(entry, menuRequest) {
    EXPLORER_treeViewNodes.getElementAt(menuRequest.target.indexItem);
    let nodeKind = BYTES[byteTreeView_byteret_pooledNode_nodeKind];
    let depthOfTheParent = INTS[fTreeView_poolret_pooledNode_depth];
    let isCollapsed = nodeKind === TreeViewNodeKind_isExpandable_NOTisExpanded || nodeKind === TreeViewNodeKind_NOTisExpandable_NOTisExpanded;

    let local_EXPLORER_menuOptionCut_object = EXPLORER_menuOptionCut_object;
    EXPLORER_menuOptionCut_object = null;
    const pasteResult = await window.myAPI.pasteClipboardAbsolutePathToDirectory(entry.absolutePath, local_EXPLORER_menuOptionCut_object?.id);
    if (!pasteResult.success) { return; }

    // TODO: I belive this final paste logic that comes after this comment and within this scope is extremely similar to the new file logic...

    if (pasteResult.isDirectory) {
        nodeKind = TreeViewNodeKind_isExpandable_NOTisExpanded;
    }
    else {
        nodeKind = TreeViewNodeKind_NOTisExpandable_NOTisExpanded;
    }

    if (isCollapsed) { return; }
    
    let targetDepth = depthOfTheParent + 1;
    let someIndex = menuRequest.target.indexItem + 1;

    // TODO: 'i_targetDepth' is a bad variable name, you're looping a minimum of until 'pasteResult.indexOf' and each loop you check
    // whether that sibling is expanded, if so you skip all the children of the sibling.
    //
    for (let i_targetDepth = 0; i_targetDepth < pasteResult.indexOf; i_targetDepth++) {
        EXPLORER_treeViewNodes.getElementAt(someIndex);
        let nodeKind = BYTES[byteTreeView_byteret_pooledNode_nodeKind];
        let isCollapsed = nodeKind === TreeViewNodeKind_isExpandable_NOTisExpanded || nodeKind === TreeViewNodeKind_NOTisExpandable_NOTisExpanded;

        let d_of_presumed_correct_depth = INTS[fTreeView_poolret_pooledNode_depth];
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

    INTS[fEXPLORER_itemHeightTotal] = EXPLORER_treeViewNodes.count_abstract * INTS[fEXPLORER_itemHeightNumber];
    EXPLORER_scrollbar_space_generator.style.height = INTS[fEXPLORER_itemHeightTotal] + 'px';
    EXPLORER_draw_BATCH_request(INTS[fEXPLORER_virtualIndex_ofScrollTop], INTS[fEXPLORER_virtualCount], 3);
}

async function NewFile_Directory_WIDGET_InputText_callback(widgetResult) {
    if (widgetResult.isCancelled) return;

    const entry = widgetResult.request.value;
    const target = widgetResult.request.target;

    EXPLORER_treeViewNodes.getElementAt(target.indexItem);
    let nodeKind = BYTES[byteTreeView_byteret_pooledNode_nodeKind];
    let depthOfTheParent = INTS[fTreeView_poolret_pooledNode_depth];
    let isCollapsed = nodeKind === TreeViewNodeKind_isExpandable_NOTisExpanded || nodeKind === TreeViewNodeKind_NOTisExpandable_NOTisExpanded;

    const newFileResult = await window.myAPI.newFile(entry.absolutePath, widgetResult.resultData, /*isDirectory*/ true);
    if (!newFileResult.success) { return; }

    // TODO: I belive this final new directory logic that comes after this comment and within this scope is 1 to 1 an exact duplication of the new file logic...
    
    nodeKind = TreeViewNodeKind_isExpandable_NOTisExpanded;

    if (!isCollapsed) {

        let targetDepth = depthOfTheParent + 1;
        let someIndex = target.indexItem + 1;

        // TODO: 'i_targetDepth' is a bad variable name, you're looping a minimum of until 'newFileResult.indexOf' and each loop you check
        // whether that sibling is expanded, if so you skip all the children of the sibling.
        //
        for (let i_targetDepth = 0; i_targetDepth < newFileResult.indexOf; i_targetDepth++) {
            EXPLORER_treeViewNodes.getElementAt(someIndex);
            let nodeKind = BYTES[byteTreeView_byteret_pooledNode_nodeKind];
            let isCollapsed = nodeKind === TreeViewNodeKind_isExpandable_NOTisExpanded || nodeKind === TreeViewNodeKind_NOTisExpandable_NOTisExpanded;

            let d_of_presumed_correct_depth = INTS[fTreeView_poolret_pooledNode_depth];
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

        INTS[fEXPLORER_itemHeightTotal] = EXPLORER_treeViewNodes.count_abstract * INTS[fEXPLORER_itemHeightNumber];
        EXPLORER_scrollbar_space_generator.style.height = INTS[fEXPLORER_itemHeightTotal] + 'px';
        EXPLORER_draw_BATCH_request(INTS[fEXPLORER_virtualIndex_ofScrollTop], INTS[fEXPLORER_virtualCount], 3);
    }
}

async function NewFile_File_WIDGET_InputText_callback(widgetResult) {
    if (widgetResult.isCancelled) return;

    const entry = widgetResult.request.value;
    const target = widgetResult.request.target;
    
    EXPLORER_treeViewNodes.getElementAt(target.indexItem);
    let nodeKind = BYTES[byteTreeView_byteret_pooledNode_nodeKind];
    let depthOfTheParent = INTS[fTreeView_poolret_pooledNode_depth];
    let isCollapsed = nodeKind === TreeViewNodeKind_isExpandable_NOTisExpanded || nodeKind === TreeViewNodeKind_NOTisExpandable_NOTisExpanded;

    const newFileResult = await window.myAPI.newFile(entry.absolutePath, widgetResult.resultData, /*isDirectory*/ false);
    if (!newFileResult.success) { return; }

    nodeKind = TreeViewNodeKind_NOTisExpandable_NOTisExpanded;

    if (isCollapsed) { return; }

    let targetDepth = depthOfTheParent + 1;
    let someIndex = target.indexItem + 1;

    // TODO: 'i_targetDepth' is a bad variable name, you're looping a minimum of until 'newFileResult.indexOf' and each loop you check
    // whether that sibling is expanded, if so you skip all the children of the sibling.
    //
    for (let i_targetDepth = 0; i_targetDepth < newFileResult.indexOf; i_targetDepth++) {
        EXPLORER_treeViewNodes.getElementAt(someIndex);
        let nodeKind = BYTES[byteTreeView_byteret_pooledNode_nodeKind];
        let isCollapsed = nodeKind === TreeViewNodeKind_isExpandable_NOTisExpanded || nodeKind === TreeViewNodeKind_NOTisExpandable_NOTisExpanded;

        let d_of_presumed_correct_depth = INTS[fTreeView_poolret_pooledNode_depth];
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

    INTS[fEXPLORER_itemHeightTotal] = EXPLORER_treeViewNodes.count_abstract * INTS[fEXPLORER_itemHeightNumber];
    EXPLORER_scrollbar_space_generator.style.height = INTS[fEXPLORER_itemHeightTotal] + 'px';
    EXPLORER_draw_BATCH_request(INTS[fEXPLORER_virtualIndex_ofScrollTop], INTS[fEXPLORER_virtualCount], 3);
}

async function DeleteFile_Directory_YesCancel_callback(widgetResult) {
    if (widgetResult.isCancelled) return;
    const entry = widgetResult.request.value;
    const target = widgetResult.request.target;
    const deleteFileResult = await window.myAPI.deleteFile(entry.absolutePath, /*isDirectory*/ true);
    if (!deleteFileResult) { return; }

    let countChanges = EXPLORER_removeFromNodeList(target.indexItem);

    INTS[fEXPLORER_itemHeightTotal] = EXPLORER_treeViewNodes.count_abstract * INTS[fEXPLORER_itemHeightNumber];
    EXPLORER_scrollbar_space_generator.style.height = INTS[fEXPLORER_itemHeightTotal] + 'px';
    EXPLORER_draw_BATCH_request(INTS[fEXPLORER_virtualIndex_ofScrollTop], INTS[fEXPLORER_virtualCount], 3);
}

async function DeleteFile_File_YesCancel_callback(widgetResult) {
    if (widgetResult.isCancelled) return;
    const entry = widgetResult.request.value;
    const target = widgetResult.request.target;
    const deleteFileResult = await window.myAPI.deleteFile(entry.absolutePath, /*isDirectory*/ false);
    if (!deleteFileResult) { return; }

    EXPLORER_treeViewNodes.removeAt(target.indexItem, 1);

    INTS[fEXPLORER_itemHeightTotal] = EXPLORER_treeViewNodes.count_abstract * INTS[fEXPLORER_itemHeightNumber];
    EXPLORER_scrollbar_space_generator.style.height = INTS[fEXPLORER_itemHeightTotal] + 'px';
    EXPLORER_draw_BATCH_request(INTS[fEXPLORER_virtualIndex_ofScrollTop], INTS[fEXPLORER_virtualCount], 3);
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
