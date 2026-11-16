
/**
 * @type {TreeViewComponent_v2}
 */
let treeViewComponent_v2_debug = null;
let treeViewComponent_v2_debug_characterWidth = 0;
let treeViewComponent_v2_debug_stringsMapByPathId = new Map();

class DIALOG_FindAll_TreeViewDirector {

    constructor() {
        /** @type {Array} object or string */
        this.actualData = null;

        /**
         * @type {TreeViewNodeList}
         * */
        this.nodeList = new TreeViewNodeList(32);
        this.component = new TreeViewComponent();
    }

    /** // Invoke this?: 'this.component.draw_render_fullReset_request();' */
    setData_causes_state_reset(actualData) {
        this.actualData = actualData;

        this.nodeList.clear();

        if (!this.actualData) {
            return;
        }

        this.component.setItems(this, INTS[fAPP_lineHeight], INTS[fAPP_lineHeight] + 'px');

        for (let i = 0; i < actualData.length; i++) {
            let nodeKind = TreeViewNodeKind_isExpandable_NOTisExpanded;
            this.nodeList.insert(this.nodeList.count_abstract, nodeKind, i, 0);
        }
        this.component.itemHeightTotal = this.tvd_getTotalCount() * this.component.itemHeightNumber;
        this.component.scrollbar_space_generator.style.height = this.component.itemHeightTotal + 'px';
    }

    /** 
     * @param {number} caseThreeOrigin if left undefined or (falsey but not 0), this will default to 'this.component.ringBufferIndexZero'
     */
    tvd_drawItem_BATCH(start, length, onePositiveDiff_twoNegativeDiff_orThreeFullScreen, caseThreeOrigin) {
        let upperBound = start + length;
        let totalCount = this.nodeList.count_abstract;
        let loopCounter = 0;

        let lastIndex = this.component.ringBufferIndexZero - 1;
        if (lastIndex < 0) {
            lastIndex += this.component.virtualCount; // TODO: 'this.component.virtualCount' or 'this.component.itemListElement.children.length'
        }

        let loopTotalIterations = upperBound - start;
        let caseTwoDivIndex = lastIndex - (loopTotalIterations - 1);
        if (caseTwoDivIndex < 0) {
            caseTwoDivIndex += this.component.itemListElement.children.length;
        }

        let verticalStyleNumber = start * this.component.itemHeightNumber;

        if (!caseThreeOrigin && caseThreeOrigin !== 0) {
            caseThreeOrigin = this.component.ringBufferIndexZero;
        }
        if (caseThreeOrigin < 0 || caseThreeOrigin >= this.component.itemListElement.children.length) {
            throw new RangeError();
        }

        for (var indexItem = start; indexItem < upperBound; indexItem++) {

            let depth = 0;
            let nodeKind = TreeViewNodeKind_NOTisExpandable_NOTisExpanded;

            let divItem;
            let divIndex;

            switch (onePositiveDiff_twoNegativeDiff_orThreeFullScreen) {
                case 1:
                    divIndex = this.component.ringBufferIndexZero + loopCounter;
                    if (divIndex >= this.component.itemListElement.children.length)
                        divIndex -= this.component.itemListElement.children.length;
                    break;
                case 2:
                    divIndex = caseTwoDivIndex++;
                    if (caseTwoDivIndex >= this.component.itemListElement.children.length)
                        caseTwoDivIndex -= this.component.itemListElement.children.length;
                    break;
                case 3:
                    divIndex = caseThreeOrigin + loopCounter;
                    if (divIndex >= this.component.itemListElement.children.length)
                        divIndex -= this.component.itemListElement.children.length;
                    break;
            }
            divItem = this.component.itemListElement.children[divIndex];

            if (indexItem >= totalCount) {
                // TODO: Will the user agent remove a text node that has an "empty" nodeValue?
                divItem.lastChild.nodeValue = '~';
                divItem.title = '';
            }
            else {
                this.nodeList.getElementAt(indexItem);
                let key = INTS[fTreeView_poolret_pooledNode_key];
                depth = INTS[fTreeView_poolret_pooledNode_depth];
                nodeKind = BYTES[byteTreeView_byteret_pooledNode_nodeKind];

                let textNode = divItem.lastChild;
                if (textNode.nodeType !== Node.TEXT_NODE) throw new Error('if (textNode.nodeType !== Node.TEXT_NODE)');
                
                let item = this.actualData[key];
                if (item.filename) {
                    textNode.nodeValue = item.filename + '(' + item.count + ')';
                    divItem.title = item.absolutePath;
                }
                else {
                    textNode.nodeValue = item;
                    divItem.title = '';
                }
            }

            switch (nodeKind) {
                case TreeViewNodeKind_isExpandable_isExpanded:
                    divItem.children[0].textContent = '-';
                    break;
                case TreeViewNodeKind_isExpandable_NOTisExpanded:
                    divItem.children[0].textContent = '+';
                    break;
                case TreeViewNodeKind_NOTisExpandable_isExpanded:
                    divItem.children[0].textContent = '';
                    break;
                case TreeViewNodeKind_NOTisExpandable_NOTisExpanded:
                    divItem.children[0].textContent = '';
                    break;
            }

            divItem.style.transform = `translate(${CONST_EXPLORER_offsetPerDepth * depth}px, ${verticalStyleNumber}px)`;
            verticalStyleNumber += this.component.itemHeightNumber;

            loopCounter++;
        }

        if (onePositiveDiff_twoNegativeDiff_orThreeFullScreen === 1) {
            let newZerothIndex = this.component.ringBufferIndexZero + loopCounter;
            if (newZerothIndex >= this.component.itemListElement.children.length) {
                newZerothIndex -= this.component.itemListElement.children.length;
            }
            this.component.ringBufferIndexZero = newZerothIndex;
        }
        else if (onePositiveDiff_twoNegativeDiff_orThreeFullScreen === 2) {
            this.component.ringBufferIndexZero = lastIndex - (loopTotalIterations - 1);
        }
    }

    tvd_drawItem_BATCH_CASE_DIFF_EQUALS_ZERO() {
        return;
    }
    
    /*** Not every key invokes this. */
    async tvd_onkeydown_async(divItem, indexItem, key) {
        
    }
    
    async tvd_ondblclick_async(divItem, indexItem) {
        this.nodeList.getElementAt(indexItem);
        let key = INTS[fTreeView_poolret_pooledNode_key];
        let depth = INTS[fTreeView_poolret_pooledNode_depth];
        let nodeKind = BYTES[byteTreeView_byteret_pooledNode_nodeKind];

        if (nodeKind === TreeViewNodeKind_NOTisExpandable_NOTisExpanded) {

            let textNode = divItem.lastChild;
            if (textNode.nodeType !== Node.TEXT_NODE) throw new Error('if (textNode.nodeType !== Node.TEXT_NODE)');

            const intValue = parseInt(textNode.nodeValue, 10);
            let absolutePath = null;

            for (let i = indexItem - 1; i >= 0; i--) {
                // If ithElementDepth < currentDepth; // then ithElement is the parent of current.
                if (this.nodeList.getDepth(i) < depth) {
                    absolutePath = this.actualData[this.nodeList.getKey(i)].absolutePath;
                    break;
                }
            }

            if (!absolutePath) {
                return;
            }
            
            await EXPLORER_openInEditor(absolutePath, /*shouldFocus*/ true);
            
            if (intValue > INTS[fEDI_lineEndPositionList_count]) {
                return;
            }

            EDI_moveCursor_indexLine_indexColumn(intValue, 0);
        }
    }
    
    tvd_oncontextmenu_async(divItem, indexItem, event_button, event_clientX, event_clientY, relativeIndex) {
        return Promise.resolve();
    }

    /**
     * TODO: To detect whether the "expand/collapse icon" was clicked, the logic 'if(event.target === nodeElement.children[0])' is used...
     * ...this logic is flawed if one ever were to put an element within the span that became the target...
     * ...thus, you should consider checking the x position of the event against the x position of the nodeElement.children[0].
     * @param {*} event 
     */
    async tvd_expandCollapseIconWasClicked_async(divItem, indexItem) {
        this.nodeList.getElementAt(indexItem);
        let key = INTS[fTreeView_poolret_pooledNode_key];
        let depth = INTS[fTreeView_poolret_pooledNode_depth];
        let nodeKind = BYTES[byteTreeView_byteret_pooledNode_nodeKind];

        if (nodeKind === TreeViewNodeKind_isExpandable_NOTisExpanded) {

            divItem.children[0].textContent = '-';
            this.nodeList.setNodeKind(indexItem, TreeViewNodeKind_isExpandable_isExpanded);

            let searchTextInput = document.getElementById('DIALOG_FindAll_searchTextInput');
            if (!searchTextInput) return;
            let results = await window.myAPI.findAllGetPositions(divItem.title, searchTextInput.value, BYTES[byteDIALOG_FindAll_options_matchWord]);
            if (!results) {
                return;
            }
            if (results.length > 0) {
                this.actualData.splice(indexItem + 1, 0, ...results);

                for (let i = indexItem + 1; i < this.nodeList.count_abstract; i++) {
                    // TODO: Maybe you could delay this cause you'd know there is an expansion at such and such and then on the fly sum it instead.
                    this.nodeList.setKey(i, this.nodeList.getKey(i) + results.length);
                }

                for (let i = 0; i < results.length; i++) {
                    let nodeKind = TreeViewNodeKind_NOTisExpandable_NOTisExpanded;
                    // TODO: Insert range, or at the least 'pre-emptively' resize the list so that it fits each insertion without resizing per insertion.
                    this.nodeList.insert(indexItem + 1 + i, nodeKind, indexItem + 1 + i, depth + 1);
                }
            }

            this.component.itemHeightTotal = this.tvd_getTotalCount() * this.component.itemHeightNumber;
            this.component.scrollbar_space_generator.style.height = this.component.itemHeightTotal + 'px';
            this.component.draw_render_fullReset_request();
        }
        else if (nodeKind === TreeViewNodeKind_isExpandable_isExpanded) {

            divItem.children[0].textContent = '+';
            this.nodeList.setNodeKind(indexItem, TreeViewNodeKind_isExpandable_NOTisExpanded);

            let countChildren = 0;
            for (let i = indexItem + 1; i < this.nodeList.count_abstract; i++) {
                // If currentDepth < ithElementDepth; then current is a parent of ithElement.
                if (depth < this.nodeList.getDepth(i)) {
                    countChildren++;
                }
                else {
                    break;
                }
            }
            if (countChildren > 0) { // TODO: is this check necessary?
                this.actualData.splice(indexItem + 1, countChildren);
                this.nodeList.removeAt(indexItem + 1, countChildren);
                for (let i = indexItem + 1; i < this.nodeList.count_abstract; i++) {
                    // TODO: Maybe you could delay this cause you'd know there is an expansion at such and such and then on the fly sum it instead.
                    this.nodeList.setKey(i, this.nodeList.getKey(i) - countChildren);
                }
                this.component.itemHeightTotal = this.tvd_getTotalCount() * this.component.itemHeightNumber;
                this.component.scrollbar_space_generator.style.height = this.component.itemHeightTotal + 'px';
                this.component.draw_render_fullReset_request();
            }
        }
    }
    
    async tvd_arrowRight_async(divItem, indexItem) {
        
	}
    
    async tvd_arrowLeft_async(divItem, indexItem) {
        
    }

    tvd_getTotalCount() {
        return this.nodeList.count_abstract;
    }

    addSpecificMenuOptionsForTarget(optionList, divItem, target) {
        
    }
}

/** @type {DIALOG_FindAll_TreeViewDirector} */
let DIALOG_FindAll_TreeViewDirector_instance = null;

function DIALOG_FindAll_Create() {
    let dialogBody = document.getElementById('DIALOG_body');

    let searchTextInput = document.createElement('input');
    searchTextInput.type = "text";
    searchTextInput.placeholder = 'find all';
    searchTextInput.id = 'DIALOG_FindAll_searchTextInput';
    searchTextInput.style.marginLeft = '5px';
    searchTextInput.style.marginTop = '5px';
    searchTextInput.style.height = APP_lineHeightStringWithPx;
    searchTextInput.style.lineHeight = APP_lineHeightStringWithPx;
    searchTextInput.addEventListener('keydown', DIALOG_FindAll_searchTextInput_onkeydown);
    dialogBody.appendChild(searchTextInput);
    searchTextInput.focus();
    
    let divOptions = document.createElement('div');
    divOptions.style.height = APP_lineHeightStringWithPx;
    divOptions.style.lineHeight = APP_lineHeightStringWithPx;
    divOptions.style.whiteSpace = 'nowrap';
    let checkboxMatchWord = document.createElement('input');
    checkboxMatchWord.type = 'checkbox';
    checkboxMatchWord.id = 'DIALOG_FindAll_checkboxMatchWord';
    checkboxMatchWord.checked = BYTES[byteDIALOG_FindAll_options_matchWord];
    checkboxMatchWord.addEventListener('change', DIALOG_FindAll_checkboxMatchWord_onchange);
    divOptions.appendChild(checkboxMatchWord);
    let label_for_checkboxMatchWord = document.createElement('label');
    label_for_checkboxMatchWord.htmlFor = 'DIALOG_FindAll_checkboxMatchWord';
    label_for_checkboxMatchWord.textContent = 'matchWord ';
    divOptions.appendChild(label_for_checkboxMatchWord);
    // TODO: The dialog body doesn't currently have an overflow scrollbar, so this will just clip if text goes offscreen due to...
    // ...the encompassing div having 'white-space: nowrap' style.
    // But this behavior is contrary to the ctrl+f. So I wanted to note it in some way with some immediacy before I continued.
    let spanNotes = document.createElement('span');
    spanNotes.id = 'DIALOG_FindAll_spanNotes';
    spanNotes.style.color = 'var(--editor-syntax-comment-color)';
    divOptions.appendChild(spanNotes);
    dialogBody.appendChild(divOptions);

    // TODO: Remove 'searchResultsDiv'? It is pointlessly wrapping.
    let searchResultsDiv = document.createElement('div');
    searchResultsDiv.id = 'DIALOG_FindAll_searchResultsDiv';
    const searchResultsDivHeightString = `calc(100% - ${2 * INTS[fAPP_lineHeight]}px - 2px)`;
    searchResultsDiv.style.height = searchResultsDivHeightString;
    searchResultsDiv.style.lineHeight = searchResultsDivHeightString;
    dialogBody.appendChild(searchResultsDiv);
}

function DIALOG_FindAll_Delete() {
    let searchTextInput = document.getElementById('DIALOG_FindAll_searchTextInput');
    if (searchTextInput) {
        searchTextInput.removeEventListener('keydown', DIALOG_FindAll_searchTextInput_onkeydown);
    }
    
    let checkboxMatchWord = document.getElementById('DIALOG_FindAll_checkboxMatchWord');
    if (checkboxMatchWord) {
    	checkboxMatchWord.removeEventListener('change', DIALOG_FindAll_checkboxMatchWord_onchange);
    }

    DIALOG_FindAll_TreeViewDirector_instance = null;
}

async function DIALOG_FindAll_searchTextInput_onkeydown(event) {
    if (event.key === 'Enter') {
        let dialogBody = document.getElementById('DIALOG_body');
        if (!dialogBody) return;
        let searchResultsDiv = document.getElementById('DIALOG_FindAll_searchResultsDiv');
        if (!searchResultsDiv) return;
        let searchTextInput = document.getElementById('DIALOG_FindAll_searchTextInput');
        if (!searchTextInput) return;
        let spanNotes = document.getElementById('DIALOG_FindAll_spanNotes');
	    if (spanNotes) {
	        spanNotes.textContent = '';
	    }

        let search = searchTextInput.value;
        if (!search) {
            return;
        }

        let results = await window.myAPI.findAll(search, BYTES[byteDIALOG_FindAll_options_matchWord]);
        if (!DIALOG_FindAll_TreeViewDirector_instance) {
            DIALOG_FindAll_TreeViewDirector_instance = new DIALOG_FindAll_TreeViewDirector();
        }
        DIALOG_FindAll_TreeViewDirector_instance.setData_causes_state_reset(results);
        DIALOG_FindAll_TreeViewDirector_instance.component.draw_create_request(searchResultsDiv, null);
    }
}

function DIALOG_FindAll_checkboxMatchWord_onchange() {
	// for an onchange event, event.target might always be precise?
	let checkboxMatchWord = document.getElementById('DIALOG_FindAll_checkboxMatchWord');
    if (checkboxMatchWord) {
    	BYTES[byteDIALOG_FindAll_options_matchWord] = checkboxMatchWord.checked;
    	let spanNotes = document.getElementById('DIALOG_FindAll_spanNotes');
	    if (spanNotes) {
	        spanNotes.textContent = 'NOTE: changing \'matchWord\' here does not re-do the search';
	    }
    }
}

function DIALOG_Settings_Create() {
    let dialogBody = document.getElementById('DIALOG_body');
    if (!dialogBody) return;

    let buttonTheme = document.createElement('button');
    buttonTheme.id = 'SETTINGS_theme';
    buttonTheme.textContent = 'Theme';
    buttonTheme.addEventListener('click', DIALOG_buttonTheme_onclick);
    dialogBody.appendChild(buttonTheme);
    
    //const buttonVerifyLspTextAgainstEditorText = document.createElement('button');
    //buttonVerifyLspTextAgainstEditorText.id = 'SETTINGS_verifyLspTextAgainstEditorText';
    //buttonVerifyLspTextAgainstEditorText.textContent = 'VerifyLspTextAgainstEditorText';
    //buttonVerifyLspTextAgainstEditorText.addEventListener('click', DIALOG_buttonVerifyLspTextAgainstEditorText_onclick);
    //dialogBody.appendChild(buttonVerifyLspTextAgainstEditorText);

    let checkboxTrueTabsFalseSpaces = document.createElement('input');
    checkboxTrueTabsFalseSpaces.type = 'checkbox';
    checkboxTrueTabsFalseSpaces.id = 'SETTINGS_trueTabs_falseSpaces';
    checkboxTrueTabsFalseSpaces.checked = BYTES[byteDIALOG_Settings_trueTabs_falseSpaces]; // Optional: sets the initial state to checked
    checkboxTrueTabsFalseSpaces.addEventListener('change', DIALOG_checkboxTrueTabsFalseSpaces_onchange);
    dialogBody.appendChild(checkboxTrueTabsFalseSpaces);
	// -----------------------------------------------------------
    let label_for_checkboxTrueTabsFalseSpaces = document.createElement('label');
    label_for_checkboxTrueTabsFalseSpaces.htmlFor = 'SETTINGS_trueTabs_falseSpaces';
    label_for_checkboxTrueTabsFalseSpaces.textContent = 'trueTabs_falseSpaces';
    dialogBody.appendChild(label_for_checkboxTrueTabsFalseSpaces);
    
    let checkboxEditorDebugShowAdjacentCharacters = document.createElement('input');
    checkboxEditorDebugShowAdjacentCharacters.type = 'checkbox';
    checkboxEditorDebugShowAdjacentCharacters.id = 'SETTINGS_editorDebugShowAdjacentCharacters';
    checkboxEditorDebugShowAdjacentCharacters.checked = BYTES[byteDIALOG_Settings_editorDebugShowAdjacentCharacters]; // Optional: sets the initial state to checked
    checkboxEditorDebugShowAdjacentCharacters.addEventListener('change', DIALOG_checkboxEditorDebugShowAdjacentCharacters_onchange);
    dialogBody.appendChild(checkboxEditorDebugShowAdjacentCharacters);
	// -----------------------------------------------------------
    let label_for_checkboxEditorDebugShowAdjacentCharacters = document.createElement('label');
    label_for_checkboxEditorDebugShowAdjacentCharacters.htmlFor = 'SETTINGS_editorDebugShowAdjacentCharacters';
    label_for_checkboxEditorDebugShowAdjacentCharacters.textContent = 'editorDebugShowAdjacentCharacters';
    dialogBody.appendChild(label_for_checkboxEditorDebugShowAdjacentCharacters);
}

function DIALOG_Settings_Delete() {
    let dialogBody = document.getElementById('DIALOG_body');
    if (!dialogBody) return;
    
    let buttonTheme = document.getElementById('SETTINGS_theme');
    if (buttonTheme) {
        buttonTheme.removeEventListener('click', DIALOG_buttonTheme_onclick);
    }

    let checkboxTrueTabsFalseSpaces = document.getElementById('SETTINGS_trueTabs_falseSpaces');
    if (checkboxTrueTabsFalseSpaces) {
        checkboxTrueTabsFalseSpaces.removeEventListener('change', DIALOG_checkboxTrueTabsFalseSpaces_onchange);
    }
    
    let checkboxEditorDebugShowAdjacentCharacters = document.getElementById('SETTINGS_editorDebugShowAdjacentCharacters');
    if (checkboxEditorDebugShowAdjacentCharacters) {
    	checkboxEditorDebugShowAdjacentCharacters.removeEventListener('change', DIALOG_checkboxEditorDebugShowAdjacentCharacters_onchange);
    }
}

function DIALOG_buttonTheme_onclick() {
    if (BYTES[byteDIALOG_Settings_isDark]) {
        BYTES[byteDIALOG_Settings_isDark] = 0;
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
    }
    else {
        BYTES[byteDIALOG_Settings_isDark] = 1;
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
    }
}

function DIALOG_buttonVerifyLspTextAgainstEditorText_onclick() {
    //window.myAPI.editorVerifyLspTextAgainstEditorText();
}

function DIALOG_checkboxTrueTabsFalseSpaces_onchange() {
    let checkboxTrueTabsFalseSpaces = document.getElementById('SETTINGS_trueTabs_falseSpaces');
    if (!checkboxTrueTabsFalseSpaces) return;

    EDI_finalizeEdit();
    BYTES[byteDIALOG_Settings_trueTabs_falseSpaces] = checkboxTrueTabsFalseSpaces.checked;
    if (BYTES[byteDIALOG_Settings_trueTabs_falseSpaces]) {
        EDI_on_tab_bytes = new Uint8Array(1);
        EDI_on_tab_bytes[0] = CONST_EDI_ASCII_TAB;
        INTS[fEDI_ontab_visualWidth_perCharacter] = 4;
    }
    else {
        EDI_on_tab_bytes = new Uint8Array(4);
        EDI_on_tab_bytes[0] = CONST_EDI_ASCII_SPACE;
        EDI_on_tab_bytes[1] = CONST_EDI_ASCII_SPACE;
        EDI_on_tab_bytes[2] = CONST_EDI_ASCII_SPACE;
        EDI_on_tab_bytes[3] = CONST_EDI_ASCII_SPACE;
        INTS[fEDI_ontab_visualWidth_perCharacter] = 1;
    }
}

function DIALOG_checkboxEditorDebugShowAdjacentCharacters_onchange() {
    let checkboxEditorDebugShowAdjacentCharacters = document.getElementById('SETTINGS_editorDebugShowAdjacentCharacters');
    if (!checkboxEditorDebugShowAdjacentCharacters) return;

    BYTES[byteDIALOG_Settings_editorDebugShowAdjacentCharacters] = checkboxEditorDebugShowAdjacentCharacters.checked;
    EDI_drawCursor(/*NOTscrollCursorIntoView*/ false);
}

function DIALOG_DocumentSymbol_Create() {
    let dialogBody = document.getElementById('DIALOG_body');
    if (!dialogBody) return;

    if (EDI_documentSymbolResult) {
        let div = document.createElement('div');
        div.textContent = 'EDI_documentSymbolResult.length: ' + EDI_documentSymbolResult.length;
        div.style.height = INTS[fAPP_lineHeight] + 'px';
        div.style.whiteSpace = 'nowrap';
        dialogBody.appendChild(div);
        EDI_listComponent.rootElement.style.height = `calc(100% - ${div.style.height})`;
        EDI_listComponent.draw_create(dialogBody, null);
    }
    else {
        dialogBody.textContent = 'EDI_documentSymbolResult is falsey';
    }
}

function DIALOG_DocumentSymbol_Delete() {
    let dialogBody = document.getElementById('DIALOG_body');
    if (!dialogBody) return;
    if (EDI_listComponent) {
        EDI_listComponent.draw_delete();
        EDI_listComponent = null;
    }
    EDI_documentSymbolResult = null;
}

function DIALOG_Debug_Create() {
    let dialogBody = document.getElementById('DIALOG_body');
    if (!dialogBody) return;

    const beforeDiv = document.createElement('div');
    beforeDiv.id = 'DEBUG_DIALOG_beforeDiv';
    beforeDiv.style.marginTop = APP_lineHeightStringWithPx; // Dialog looks jank at the moment I'm gonna just do this so I can read the text
    beforeDiv.style.height = APP_lineHeightStringWithPx;
    beforeDiv.appendChild(document.createTextNode('LISTENING'));

    const amongDiv = document.createElement('div');
    amongDiv.id = 'DEBUG_DIALOG_amongDiv';
    amongDiv.style.height = APP_lineHeightStringWithPx;
    amongDiv.appendChild(document.createTextNode('LISTENING'));

    const afterDiv = document.createElement('div');
    afterDiv.id = 'DEBUG_DIALOG_afterDiv';
    afterDiv.style.height = APP_lineHeightStringWithPx;
    afterDiv.appendChild(document.createTextNode('LISTENING'));

    dialogBody.appendChild(beforeDiv);
    dialogBody.appendChild(amongDiv);
    dialogBody.appendChild(afterDiv);
}

function DIALOG_Debug_Delete() {
}

function DIALOG_Debug_Refresh(customEditorGetNodesAdjacentToCursorFromLspRequestResponse) {
    const beforeDiv = document.getElementById('DEBUG_DIALOG_beforeDiv');
    const amongDiv = document.getElementById('DEBUG_DIALOG_amongDiv');
    const afterDiv = document.getElementById('DEBUG_DIALOG_afterDiv');

    let textNode = null;

    textNode = beforeDiv.firstChild;
    textNode.replaceData(0, textNode.length, `${customEditorGetNodesAdjacentToCursorFromLspRequestResponse.Before.SyntaxKindString}\n\t${customEditorGetNodesAdjacentToCursorFromLspRequestResponse.Before.Identifier}\n\t(${customEditorGetNodesAdjacentToCursorFromLspRequestResponse.Before.PositionIndex})`);

    textNode = amongDiv.firstChild;
    textNode.replaceData(0, textNode.length, `${customEditorGetNodesAdjacentToCursorFromLspRequestResponse.Among.SyntaxKindString}\n\t${customEditorGetNodesAdjacentToCursorFromLspRequestResponse.Among.Identifier}\n\t(${customEditorGetNodesAdjacentToCursorFromLspRequestResponse.Among.PositionIndex})`);

    textNode = afterDiv.firstChild;
    textNode.replaceData(0, textNode.length, `${customEditorGetNodesAdjacentToCursorFromLspRequestResponse.After.SyntaxKindString}\n\t${customEditorGetNodesAdjacentToCursorFromLspRequestResponse.After.Identifier}\n\t(${customEditorGetNodesAdjacentToCursorFromLspRequestResponse.After.PositionIndex})`);
}

function DIALOG_Debug_treeViewComponent_v2_Create() {
    let dialogBody = document.getElementById('DIALOG_body');
    if (!dialogBody) return;

    if (EXPLORER_chosenWorkspace === -1) {
        const div = document.createElement('div');
        div.id = 'Debug_treeViewComponent_v2_div';
        div.style.marginTop = APP_lineHeightStringWithPx; // Dialog looks jank at the moment I'm gonna just do this so I can read the text
        div.style.height = APP_lineHeightStringWithPx;
        div.appendChild(document.createTextNode('EXPLORER_chosenWorkspace === -1'));
        dialogBody.appendChild(div);
        return;
    }

    dialogBody.appendChild(treeViewComponent_v2_debug.rootElement);

    Debug_treeViewComponent_v2_resizeCanvases();

    treeViewComponent_v2_debug.itemHeightTotal = (treeViewComponent_v2_debug.countAbstract + 2) * treeViewComponent_v2_debug.itemHeightNumber;
    treeViewComponent_v2_debug.scrollbarSpaceGenerator.style.height = treeViewComponent_v2_debug.itemHeightTotal + 'px';

    treeViewComponent_v2_debug.forceFullscreen_renderScroll();

    treeViewComponent_v2_debug.draw_addEvents();
}

function DIALOG_Debug_treeViewComponent_v2_Delete() {
    if (treeViewComponent_v2_debug) {
        treeViewComponent_v2_debug.dispose();
        treeViewComponent_v2_debug = null;
    }
}

function Debug_treeViewComponent_v2_resizeCanvases() {
    const dpr = window.devicePixelRatio || 1;

    const viewportRect = treeViewComponent_v2_debug.visualCanvas.getBoundingClientRect();
    const viewWidth = viewportRect.width;
    const viewHeight = viewportRect.height;

    const textCanvas = treeViewComponent_v2_debug.canvas;
    const textLayoutWidth = viewWidth;
    textCanvas.style.width = textLayoutWidth + 'px';
    textCanvas.style.height = viewHeight + 'px';
    textCanvas.width = textLayoutWidth * dpr;
    textCanvas.height = viewHeight * dpr;

    const ctxText = textCanvas.getContext('2d');
    ctxText.scale(dpr, dpr);
    ctxText.font = '14px monospace';
    ctxText.textBaseline = 'top';
    ctxText.fillStyle = '#ffffff';

    const metrics = ctxText.measureText('M');

    const fontHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    const linePadding = 6; // Total padding between lines
    treeViewComponent_v2_debug.itemHeightNumber = fontHeight + linePadding;
    
    const charWidth = ctxText.measureText('M').width; // The exact pixel width of every single character in a monospace font
    treeViewComponent_v2_debug_characterWidth = charWidth;

    ctxText.font = '14px monospace'; // Run once during setup / font configuration

    treeViewComponent_v2_debug.offsetWidth = Math.floor(viewportRect.width);
    treeViewComponent_v2_debug.offsetHeight = Math.floor(viewportRect.height);

    treeViewComponent_v2_debug.virtualCount = Math.ceil(treeViewComponent_v2_debug.offsetHeight / treeViewComponent_v2_debug.itemHeightNumber);
}

function Debug_treeViewComponent_v2_renderLines(lineIndexLower, lineIndexUpper, ringBufferIndex, decodingBoundLower, decodingBoundUpper) {

    const ctx = treeViewComponent_v2_debug.canvas.getContext('2d');
    ctx.clearRect(0, 0, treeViewComponent_v2_debug.canvas.width, treeViewComponent_v2_debug.canvas.height);
    ctx.fillStyle = '#d4d4d4';

    let vertical = 0;

    // TODO: All of the below 'Optimization heuristic goal' suck. Cause you have no idea whether they're actually effective you're just hearing rumors and then throwing them all at a dart board and hoping everything works out.
    //
    /** Optimization heuristic goal: assumedly reduce reference chasing by creating a const reference to fields that are frequently accessed via a member access on a reference variable. It is rumored that this permits loop optimization. */
    /** Optimization heuristic goal: similarly^ assumedly improve caching by explicitly telling the code generator that the reference which 'foo' points to "will not change". In garbage collection, when defragmenting the heap every reference to an object that was repositioned needs to have its reference updated to point to the new location of the object, so I'm not quite sure how this works out idk. It is rumored that this permits loop optimization. */
    const VIRTUAL_COUNT = treeViewComponent_v2_debug.virtualCount;
    const DATA_LITERAL = treeViewComponent_v2_debug.dataLiteral;
    const COUNT_ABSTRACT = treeViewComponent_v2_debug.countAbstract;
    const FIELD_COUNT = treeViewComponent_v2_debug.fieldCount;
    const KEY_OFFSET = treeViewComponent_v2_debug.keyOffset;
    const NODE_KIND_OFFSET = treeViewComponent_v2_debug.nodeKindOffset;
    const LINE_CACHE = treeViewComponent_v2_debug.lineCache;
    const ITEM_HEIGHT_NUMBER = treeViewComponent_v2_debug.itemHeightNumber;
    /** Optimization heuristic goal: This one specifically is to bring this global scope variable into local scope rather than relying on caching alone this ought to signal further the importance of the variable being cached. It is rumored that this permits loop optimization. */
    const STRINGS_MAP_BY_PATH_ID = treeViewComponent_v2_debug_stringsMapByPathId;

    /** Optimization heuristic goal: make the upper bound a constant, and do not modify 'i' within the loop, have not measured if this is truly impactful. It is rumored that this permits loop optimization. */
    const LINE_INDEX_UPPER = lineIndexUpper;

    for (let i = lineIndexLower; i < LINE_INDEX_UPPER; i++) {
        ringBufferIndex++;
        if (ringBufferIndex >= VIRTUAL_COUNT) {
            ringBufferIndex -= VIRTUAL_COUNT;
        }

        if (i >= decodingBoundLower && i < decodingBoundUpper) {
            if (i < COUNT_ABSTRACT) {
                const key = DATA_LITERAL[i * FIELD_COUNT + KEY_OFFSET];
                const nodeKind = DATA_LITERAL[i * FIELD_COUNT + NODE_KIND_OFFSET];
                let name = STRINGS_MAP_BY_PATH_ID.get(key) ?? `unknown_${i}`;
                let chevronRepresentation = ' ';
                switch (nodeKind) {
                    case TreeViewNodeKind_isExpandable_isExpanded:
                        chevronRepresentation = '-';
                        break;
                    case TreeViewNodeKind_isExpandable_NOTisExpanded:
                        chevronRepresentation = '+';
                        break;
                    case TreeViewNodeKind_NOTisExpandable_isExpanded:
                        chevronRepresentation = '';
                        break;
                    case TreeViewNodeKind_NOTisExpandable_NOTisExpanded:
                        chevronRepresentation = '';
                        break;
                }
                LINE_CACHE[ringBufferIndex] = chevronRepresentation + name;
            }
            else {
                LINE_CACHE[ringBufferIndex] = '~';
            }
        }

        ctx.fillText(LINE_CACHE[ringBufferIndex], 0, vertical); // There's a max width argument in the fillText?
        vertical += ITEM_HEIGHT_NUMBER;
    }
}
