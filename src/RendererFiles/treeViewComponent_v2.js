/*
const v2_TREEVIEWrenderKind_None = 0;
const v2_TREEVIEWrenderKind_Cursor = 1;
const v2_TREEVIEWrenderKind_Create = 2;
const v2_TREEVIEWrenderKind_Batch = 3;
const v2_TREEVIEWrenderKind_Scroll = 4;
const v2_TREEVIEWrenderKind_SetItems = 5;
const v2_TREEVIEWrenderKind_FullReset = 6;
const v2_TREEVIEWrenderKind_Scroll_PullDataDrawResult = 7;
const v2_TREEVIEWrenderKind_Resize = 8;

const v2_TreeViewNodeKind_None = 0;
const v2_TreeViewNodeKind_isExpandable_isExpanded = 1;
const v2_TreeViewNodeKind_isExpandable_NOTisExpanded = 2;
const v2_TreeViewNodeKind_NOTisExpandable_isExpanded = 3;
const v2_TreeViewNodeKind_NOTisExpandable_NOTisExpanded = 4;
*/

class TreeViewComponent_v2_staticRunner {
    constructor() {
        this.queueHead = 0;
        this.queueTail = 0;
        this.renderIsPending = false;

        this.CAPACITY = 32;
        this.UI_SLOT_MASK = this.CAPACITY - 1; // 31
        this.MASTER_RENDER_BUFFER = new Uint8Array(this.CAPACITY * 2); // 64 bytes

        this.runnerContexts = [];
        this.freeRunnerIds = [];

        // Bind once in constructor so rAF doesn't allocate a closure per frame
        this.renderLoop = this.TreeViewComponent_v2_render_do.bind(this);
    }

    TreeViewComponent_v2_render_request(renderKind, runnerId) {
        const count = this.queueTail - this.queueHead;
        
        if (count > 0) {
            const lastByteOffset = ((this.queueTail - 1) & this.UI_SLOT_MASK) << 1;
            if (
                this.MASTER_RENDER_BUFFER[lastByteOffset] === renderKind &&
                this.MASTER_RENDER_BUFFER[lastByteOffset + 1] === runnerId
            ) {
                return;
            }
        }

        // Guard against buffer overflow within a single frame
        if (count >= this.CAPACITY) {
            this.TreeViewComponent_v2_render_do();
        }

        const byteOffset = (this.queueTail & this.UI_SLOT_MASK) << 1;
        this.MASTER_RENDER_BUFFER[byteOffset] = renderKind;
        this.MASTER_RENDER_BUFFER[byteOffset + 1] = runnerId;
        this.queueTail++;

        if (!this.renderIsPending) {
            this.renderIsPending = true;
            requestAnimationFrame(this.renderLoop);
        }
    }

    TreeViewComponent_v2_render_do() {
        while (this.queueHead !== this.queueTail) {
            const byteOffset = (this.queueHead & this.UI_SLOT_MASK) << 1;
            const renderKind = this.MASTER_RENDER_BUFFER[byteOffset];
            const runnerId = this.MASTER_RENDER_BUFFER[byteOffset + 1];
            this.queueHead++;

            const component = this.runnerContexts[runnerId];
            if (!component) continue; // Component was removed before frame fired

            console.log('TreeViewComponent_v2_render_do');

            switch (renderKind) {
                case TREEVIEWrenderKind_Cursor:
                    component.TreeViewComponent_v2_render_do_Cursor();
                    break;
                // ... remaining cases
            }
        }
        this.renderIsPending = false;
    }

    add(treeViewComponent_v2) {
        if (this.freeRunnerIds.length > 0) {
            const reusedId = this.freeRunnerIds.pop();
            this.runnerContexts[reusedId] = treeViewComponent_v2;
            return reusedId;
        }
        this.runnerContexts.push(treeViewComponent_v2);
        return this.runnerContexts.length - 1;
    }

    remove(treeViewComponent_v2) {
        const id = treeViewComponent_v2.runnerId;
        if (id == null || this.runnerContexts[id] !== treeViewComponent_v2) {
            throw new Error("Invalid or unregistered runnerId");
        }
        this.runnerContexts[id] = null;
        this.freeRunnerIds.push(id);
    }
}


/** TODO: Does JavaScript have static classes, I don't want to go down a rabbit hole right now. */
const treeViewComponent_v2_staticRunner = new TreeViewComponent_v2_staticRunner();

/**
 * You could probably calculate the ringBuffer diff in the scroll event then pass that information to a non-TreeViewComponent_v2 defined function.
 * The consumer of the 'TreeViewComponent_v2' would provide a function that knows how to draw everything?
 * The main thing to avoid is probably invoking "per line being drawn" some function that knows how to draw a line.
 */
class TreeViewComponent_v2 {
    /**
     * @param {number} initialCapacityAbstract 
     * @param {TreeViewComponent_v2_staticRunner} treeViewComponent_v2_staticRunner 
     */
    constructor(initialCapacityAbstract, treeViewComponent_v2_staticRunner) {

        this.treeViewComponent_v2_staticRunner = treeViewComponent_v2_staticRunner;
        
        this.runnerId = treeViewComponent_v2_staticRunner.add(this);

        this.rootElement = document.createElement('div');
        this.rootElement.classList.add('TREEVIEW', 'unselectable');
        this.rootElement.tabIndex = 0;
        this.rootElement.style.height = '100%';

        this.scrollViewport = document.createElement('div');
        this.scrollViewport.className = 'TREEVIEW_scroll_viewport';
        this.scrollbarSpaceGenerator = document.createElement('div');
        this.scrollbarSpaceGenerator.className = 'TREEVIEW_scrollbar_space_generator';
        this.scrollViewport.appendChild(this.scrollbarSpaceGenerator);
        this.rootElement.appendChild(this.scrollViewport);

        this.visualCanvas = document.createElement('div');
        this.visualCanvas.className = 'TREEVIEW_visual_canvas';
        this.canvas = document.createElement('canvas');
        this.visualCanvas.appendChild(this.canvas);
        this.rootElement.appendChild(this.visualCanvas);

        this.itemHeightTotal = 0;

        /** Consider the existence of such methods as 'state_cursor_setIndex' before mutating state directly */
        this.cursorIndex = 0;

        this.currentVirtualIndex = 0;
        this.currentVirtualCount = 0;

        this.previousVirtualIndex = 0;
        this.previousVirtualCount = 0;

        this.scrollLeft = 0;
        this.scrollTop = 0;
        
        this.scrollTimer = null;
        this.hasTrailingCall = false;

        this.ringBufferIndexZero = 0;

        this.ringBuffer = [];
        this.ringBufferLength = 0;

        this.TREEVIEW_draw_create_request_parentElement = null;
        this.TREEVIEW_draw_create_request_insertBeforeThisChild = null;

        this.start = 0;
        this.length = 0;
        this.onePositiveDiff_twoNegativeDiff_orThreeFullScreen = 0;
        this.caseThreeOrigin = 0;

        this.SET_ITEMS_director = null;
        this.SET_ITEMS_itemHeightNumber = 0;
        this.SET_ITEMS_itemHeightStyleAttributeValueString = '';

        this.WIDTH_NODE_DRAWN_NUMBER_IN_CH_UNITS_NO_PADDING = 2;

        this.LARGEST_DEPTH_SEEN_NOT_THE_CSS_JUST_THE_DEPTH = 0;

        // Bind once in constructor so ... doesn't allocate a closure per ...
        this.eventScroll = this.event_scroll.bind(this);

        // tvnl_

        this.dataLiteral = undefined;
        this.capacityLiteral = undefined;

        this.capacityAbstract = undefined;
        this.countAbstract = 0;

        // Storing the nodeKind as an int32 isn't the most ideal thing in the world.
        // Previously the ints were being grouped via a class instance.
        // So this still ought to be better than what was done previously.
        this.fieldCount = 3;
        // this.nodeKind = nodeKind;
        // this.key = key;
        // this.depth = depth;

        this.nodeKindOffset = 0;
        this.keyOffset = 1;
        this.depthOffset = 2;

        let tempCapacityLiteral = initialCapacityAbstract * this.fieldCount;

        this.dataLiteral = new Uint32Array(tempCapacityLiteral);
        this.capacityAbstract = initialCapacityAbstract;
        this.capacityLiteral = tempCapacityLiteral;

        this.countAbstract = 0;
    }

    /**
     * TODO: Many of these suffer from two invocations sitting in the render queue with something between them so they didn't coallesce then the parameters
     * of the second are used for the first.
     */
    TREEVIEW_render_do_SetItems() {
        this.itemListElement.innerHTML = '';
        this.scrollbarSpaceGenerator.style.height = 1 + 'px';
        this.state_cursor_setIndex(0);
        
        this.director = this.SET_ITEMS_director;
        this.itemHeightNumber = this.SET_ITEMS_itemHeightNumber;
        this.itemHeightStyleAttributeValueString = this.SET_ITEMS_itemHeightStyleAttributeValueString;

        this.cursorElement.style.height = this.itemHeightStyleAttributeValueString;
        this.itemHeightTotal = this.director.tvd_getTotalCount() * this.itemHeightNumber;
        this.scrollbarSpaceGenerator.style.height = this.itemHeightTotal + 'px';
        this.boundingClientRect = null;
    }

    /**
     * @param {*} director interface TreeViewDirectory { director.drawItem(divItem, indexItem), director.onkeydown(this.TREEVIEW_ArrayFrom_itemListElement_children[relativeIndex], this.cursorIndex, this.items[this.cursorIndex]); }
     * @param {*} itemHeightNumber '50'; cursorTop = currentIndex * itemHeightNumber;
     * @param {*} itemHeightStyleAttributeValueString '50px'; div.style.height = itemHeightStyleAttributeValueString;
     */
    setItems(director, itemHeightNumber, itemHeightStyleAttributeValueString) {
        this.SET_ITEMS_director = director;
        this.SET_ITEMS_itemHeightNumber = itemHeightNumber;
        this.SET_ITEMS_itemHeightStyleAttributeValueString = itemHeightStyleAttributeValueString;
        this.TREEVIEW_render_request(TREEVIEWrenderKind_SetItems);
    }

    TREEVIEW_render_do_Create() {
        if (this.rootElement.parentElement) {
            // It is the case that I invoke 'draw_create_request' when creating the tree view for the first time.
            // But I also do this when I re-open the os input file dialog and pick either a separate or the same folder.
            // In this scenario having this invoke a "fullReset" is necessary otherwise nothing appears in the treeview.
            //
            // TODO: but, perhaps this is best left to the consumer of the TreeViewComponent to invoke themselves...
            // ...in such a scenario. Until further decision is made I'll have the invocation here.
            this.TREEVIEW_render_do_FullReset();
            // TODO: Should there be a return here?...
            // ...more accurately the concern is 'TREEVIEW_draw_create_request_parentElement.insertBefore'
            // and 'this.draw_addEvents()'
            // |
            // Should those be in an else?
            // It reads as though you'd be inserting the element twice, which internally you cannot
            // have an HTML node with two parents so this probably doesn't duplicate the UI, but instead just wastes CPU.
            // |
            // The 'this.draw_addEvents();'... can you subscribe twice?
        }
        this.TREEVIEW_draw_create_request_parentElement.insertBefore(this.rootElement, this.TREEVIEW_draw_create_request_insertBeforeThisChild);
        this.draw_addEvents();

        this.measureBaseElement();

        this.TREEVIEW_render_do_Scroll();
    }

    /**
     * if (this.rootElement.parentElement) { this.draw_render_fullReset_request(); return; }
     * Because the "list" is already drawn somewhere and 'draw_delete()' needs to be invoked prior to drawing at a different location.
     * 
     * @param {HTMLElement} parentElement 
     * @param {*} insertBeforeThisChild (if falsey, the list UI is appended to the parent element)
     */
    draw_create_request(parentElement, insertBeforeThisChild) {
        this.TREEVIEW_draw_create_request_parentElement = parentElement;
        this.TREEVIEW_draw_create_request_insertBeforeThisChild = insertBeforeThisChild;
        this.TREEVIEW_render_request(TREEVIEWrenderKind_Create);
    }

    TREEVIEW_render_do_Batch() {
        this.director.tvd_drawItem_BATCH(this.start, this.length, this.onePositiveDiff_twoNegativeDiff_orThreeFullScreen, this.caseThreeOrigin);
    }

    /**
     * if (!this.rootElement.parentElement) return;
     * Because the "list" is not drawn, no UI needs to be removed.
     * (the purpose of this method is more-so related to unsubscribing of events and other such non-automatic actions that need to be performed)
     * 
     * @returns 
     */
    draw_delete() {
        if (!this.rootElement.parentElement) return;
        this.draw_removeEvents();
        this.boundingClientRect = null;
        this.rootElement.parentElement.removeChild(this.rootElement);
    }

    draw_addEvents() {
        this.scrollViewport.addEventListener('scroll', this.eventScroll, { passive: true });
        //this.scrollViewport.addEventListener.

        //this.rootElement.addEventListener('click', this);
        //this.rootElement.addEventListener('keydown', this);
        //this.scrollViewport.addEventListener('scroll', this, { passive: true });
        //this.rootElement.addEventListener('dblclick', this);
        //this.rootElement.addEventListener('contextmenu', this);
        //window.addEventListener('resize', this);
    }
    
    draw_removeEvents() {
        this.scrollViewport.removeEventListener('scroll', this.eventScroll, { passive: true });

        //this.rootElement.removeEventListener('click', this);
        //this.rootElement.removeEventListener('keydown', this);
        //this.scrollViewport.removeEventListener('scroll', this, { passive: true });
        //this.rootElement.addEventListener('dblclick', this);
        //this.rootElement.addEventListener('contextmenu', this);
        //window.removeEventListener('resize', this);
    }

    // The browser automatically looks for this exact method name
    handleEvent(event) {
        switch (event.type) {
            case 'click':
                this.event_click(event.clientY, event.clientX);
                break;
            case 'keydown':
                this.event_keydown(event);
                break;
            case 'scroll':
                this.event_scroll();
                break;
            case 'dblclick':
                this.event_dblclick(event.clientY, event.target);
                break;
            case 'contextmenu':
                this.event_contextmenu(event.button, event.clientX, event.clientY);
                break;
            case 'resize':
                this.event_windowResize();
                break;
        }
    }

    TREEVIEW_render_do_Scroll() {
        if (this.ringBufferLength !== this.virtualCount) {
            this.TREEVIEW_render_do_FullReset();
        }
        else {

            this.text.style.transform = `translate3d(-${this.scrollLeft}px, -${this.scrollTop}px, 0)`;

            this.virtualIndex_ofScrollTop = Math.floor(this.scrollTop / this.itemHeightNumber);

            if (this._ONSCROLLvirtualIndex === this.virtualIndex_ofScrollTop &&
                this._ONSCROLLvirtualCount === this.virtualCount) {
                    return;
            }

            // If I delay setting 'this._ONSCROLLvirtualIndex' then I can just use that.
            // I can't bear to do that right now though. I'm just gonna make this variable.
            let prevVli = this._ONSCROLLvirtualIndex;
            let currVli = this.virtualIndex_ofScrollTop;

            this._ONSCROLLvirtualIndex = this.virtualIndex_ofScrollTop;

            if (this._ONSCROLLvirtualCount === this.virtualCount &&
                this.ringBufferLength === this.virtualCount) {

                let diff = currVli - prevVli;

                if (diff > 0 && diff < this.virtualCount) {
                    this.director.tvd_drawItem_BATCH(prevVli + this._ONSCROLLvirtualCount, diff, 1, undefined);
                }
                else if (diff < 0 && (diff *= -1) < this.virtualCount) {
                    this.director.tvd_drawItem_BATCH(currVli, diff, 2, undefined);
                }
                else {
                    if (diff === 0) {
                        this.director.tvd_drawItem_BATCH_CASE_DIFF_EQUALS_ZERO();
                    }
                    else {
                        this.director.tvd_drawItem_BATCH(this.virtualIndex_ofScrollTop, this.virtualCount, 3, undefined);
                    }
                }
            }
        }
    }

    TREEVIEW_render_do_Scroll_PullDataDrawResult() {
        if (this.director.tvd_drawItem_BATCH_PullDataDrawResult) {
            this.director.tvd_drawItem_BATCH_PullDataDrawResult();
        }
    }

    draw_BATCH_request(start, length, onePositiveDiff_twoNegativeDiff_orThreeFullScreen, caseThreeOrigin) {
        this.start = start;
        this.length = length;
        this.onePositiveDiff_twoNegativeDiff_orThreeFullScreen = onePositiveDiff_twoNegativeDiff_orThreeFullScreen;
        this.caseThreeOrigin = caseThreeOrigin;
        this.TREEVIEW_render_request(TREEVIEWrenderKind_Batch);
    }

    TREEVIEW_render_do_FullReset() {
        this.ensure_boundingClientRect();

        this._ONSCROLLvirtualCount = this.virtualCount;

        this.virtualIndex_ofScrollTop = Math.floor(this.scrollTop / this.itemHeightNumber);
        this.ringBufferIndexZero = 0;

        if (this.itemListElement.children.length !== this.virtualCount) {
            this.itemListElement.innerHTML = '';

            // padding of 2ch (the style attribute receives the width as a pixel by using 'INTS[fEXPLORER_firstSpanWidthValue]' as a baseline (not quite ch))
            // TODO: this is all very inaccurate and prone to eventual rounding issues due to not monospace font.
            //
            this.WIDTH_NODE_DRAWN_NUMBER_IN_CH_UNITS_NO_PADDING = 2;
            let widthAttributeValueNumber = Math.ceil((this.WIDTH_NODE_DRAWN_NUMBER_IN_CH_UNITS_NO_PADDING + 2/*padding*/) * INTS[fEXPLORER_firstSpanWidthValue]);
            // This is actually more complicated you have to track whether you go above the minimum requirement lest you add 1 character over and over in width just to keep redrawing widths.
            //if (widthAttributeValueNumber < this.lastReadNumber_offsetWidth) {
            //    widthAttributeValueNumber = this.lastReadNumber_offsetWidth;
            //}
            //this.WIDTH_NODE_DRAWN_NUMBER_IN_CH_UNITS_NO_PADDING
            let widthAttributeValueString = widthAttributeValueNumber + 'px';
            this.cursorElement.style.width = widthAttributeValueString;

            // this is zero'd, could use change for clarity of algorithm and match patterns but focus elsewhere first
            for (let i = 0; i < this.virtualCount; i++) {
                
                let divItem = document.createElement('div');
                divItem.style.width = widthAttributeValueString;
                divItem.style.height = this.itemHeightStyleAttributeValueString;
                divItem.style.whiteSpace = 'nowrap';
                divItem.style.position = 'absolute';
                this.itemListElement.appendChild(divItem);
                let iconSpan = document.createElement('span');
                iconSpan.style.width = EXPLORER_firstSpanWidth;
                iconSpan.style.display = 'inline-block';
                // TODO: Consider what differences if any exist between the '' iconSpan having an empty height of 0 when left unset, versus if you were to set it to 1px, does this matter? It doesn't seem to impact the "horizontal" space being taken.
                divItem.appendChild(iconSpan);
                divItem.appendChild(document.createTextNode(i));
            }
            
            // TODO: check the resize logic, that it works
            if (this.director.pullData_array) {
                this.director.pullData_array = new Uint32Array(this.virtualCount);
                this.director.pullData_array_count = 0;
            }

            this.ringBuffer = Array.from(this.itemListElement.children);
            this.ringBufferLength = this.ringBuffer.length;
        }

        // TODO: This if statement check is awkward because the previous if statement ought to have guaranteed this one to be true.
        if (this.itemListElement.children.length === this.virtualCount) {
            this.director.tvd_drawItem_BATCH(this.virtualIndex_ofScrollTop, this.virtualCount, 3, undefined);
        }
    }

    /**
     * This actually only gets invoked if 'this.itemListElement.children.length !== this.virtualCount'...
     * ...But it is a bit more complicated if you want to involve a change to totalCount, you'd need to force the final 'else' case
     * so it is easier to just invoke this directly when you change totalCount?
     */
    draw_render_fullReset_request() {
        this.TREEVIEW_render_request(TREEVIEWrenderKind_FullReset);
    }

    /**
     * TODO: To detect whether the "expand/collapse icon" was clicked, the logic 'if(event.target === nodeElement.children[0])' is used...
     * ...this logic is flawed if one ever were to put an element within the span that became the target...
     * ...thus, you should consider checking the x position of the event against the x position of the nodeElement.children[0].
     * @param {*} event 
     */
    event_click(event_clientY, event_clientX) {
        // TODO: Change order of the function parameters?
        this.ensure_boundingClientRect();

        let rY = event_clientY - this.boundingClientRect.top + this.scrollTop;
        let indexItem = Math.floor(rY / this.itemHeightNumber);
        indexItem = this.state_cursor_validateIndex(indexItem);

        // See comment "Awkward explicit inlining of 'this.indexItemTo_ringBufferIndexItem'" for more information.
        let ringBufferIndexItem = ((indexItem)) - this.virtualIndex_ofScrollTop;
        if (ringBufferIndexItem >= this.ringBufferLength || ringBufferIndexItem < 0) ringBufferIndexItem = -1;
        else ringBufferIndexItem = (ringBufferIndexItem + this.ringBufferIndexZero) % this.virtualCount;
        if (ringBufferIndexItem < 0) return;

        let divItem = this.ringBuffer[ringBufferIndexItem];

        // TODO: 'event_dblclick' with this depth logic?
        // TODO: this component throws an exception when scrolling it just straight up doesn't work (well it does until it crashes the app)
        const depth = this.director.nodeList.getDepth(indexItem);
        const rX = (event_clientX - this.boundingClientRect.left + this.scrollLeft) - (depth * CONST_EXPLORER_offsetPerDepth);
        if (rX >= 0 && rX <= EDI_characterWidth) {
            return this.director.tvd_expandCollapseIconWasClicked_async(divItem, indexItem);
        }
        else {
            this.state_cursor_setIndex(indexItem);
        }
    }

    event_dblclick(event_clientY, event_target) {
        this.ensure_boundingClientRect();

        let rY = event_clientY - this.boundingClientRect.top + this.scrollTop;
        let indexItem = Math.floor(rY / this.itemHeightNumber);
        indexItem = this.state_cursor_validateIndex(indexItem);

        // See comment "Awkward explicit inlining of 'this.indexItemTo_ringBufferIndexItem'" for more information.
        let ringBufferIndexItem = ((indexItem)) - this.virtualIndex_ofScrollTop;
        if (ringBufferIndexItem >= this.ringBufferLength || ringBufferIndexItem < 0) ringBufferIndexItem = -1;
        else ringBufferIndexItem = (ringBufferIndexItem + this.ringBufferIndexZero) % this.virtualCount;

        if (ringBufferIndexItem < 0) return;
        let divItem = this.ringBuffer[ringBufferIndexItem];

        // if not clicked "chevron"
        if (event_target !== divItem.children[0]) {
            // See comment "Awkward explicit inlining of 'this.indexItemTo_ringBufferIndexItem'" for more information.
            let ringBufferIndexItem = ((this.cursorIndex)) - this.virtualIndex_ofScrollTop;
            if (ringBufferIndexItem >= this.ringBufferLength || ringBufferIndexItem < 0) ringBufferIndexItem = -1;
            else ringBufferIndexItem = (ringBufferIndexItem + this.ringBufferIndexZero) % this.virtualCount;

            if (ringBufferIndexItem < 0) return;
            return this.director.tvd_ondblclick_async(this.ringBuffer[ringBufferIndexItem], this.cursorIndex);
        }
    }

    event_contextmenu(event_button, event_clientX, event_clientY) {
        this.ensure_boundingClientRect();

        if (event_button === 2) {
            let rY = event_clientY - this.boundingClientRect.top + this.scrollTop;

            this.state_cursor_setIndex(this.state_cursor_validateIndex(
                Math.floor(rY / this.itemHeightNumber)));

            // TODO: you need to move this above the divItem assignment and do checks earlier... double check all other uses

            // See comment "Awkward explicit inlining of 'this.indexItemTo_ringBufferIndexItem'" for more information.
            let ringBufferIndexItem = ((this.cursorIndex)) - this.virtualIndex_ofScrollTop;
            if (ringBufferIndexItem >= this.ringBufferLength || ringBufferIndexItem < 0) ringBufferIndexItem = -1;
            else ringBufferIndexItem = (ringBufferIndexItem + this.ringBufferIndexZero) % this.virtualCount;

            if (ringBufferIndexItem < 0) return;
            return this.director.tvd_oncontextmenu_async(this.ringBuffer[ringBufferIndexItem], this.cursorIndex, event_button, event_clientX, event_clientY, ringBufferIndexItem);
        }
        else {
            if (this.cursorIndex >= this.director.tvd_getTotalCount()) {
                return;
            }

            this.state_cursor_setIndex(this.state_cursor_validateIndex(
                this.cursorIndex));

            // See comment "Awkward explicit inlining of 'this.indexItemTo_ringBufferIndexItem'" for more information.
            let ringBufferIndexItem = ((this.cursorIndex)) - this.virtualIndex_ofScrollTop;
            if (ringBufferIndexItem >= this.ringBufferLength || ringBufferIndexItem < 0) ringBufferIndexItem = -1;
            else ringBufferIndexItem = (ringBufferIndexItem + this.ringBufferIndexZero) % this.virtualCount;

            if (ringBufferIndexItem < 0) return;

            // TODO: Handle context menu with keyboard when active node is out of view
            return this.director.tvd_oncontextmenu_async(this.ringBuffer[ringBufferIndexItem], this.cursorIndex, event_button, event_clientX, event_clientY, ringBufferIndexItem);
        }
    }

    event_keydown(event) {
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                if (event.ctrlKey) {
                    this.scrollViewport.scrollBy(0, this.itemHeightNumber);
                }
                else {
                    this.state_cursor_setIndex(this.state_cursor_validateIndex(
                        this.cursorIndex + 1));
                }
                return;
            case 'ArrowUp':
                event.preventDefault();
                if (event.ctrlKey) {
                    this.scrollViewport.scrollBy(0, -1 * this.itemHeightNumber);
                }
                else {
                    this.state_cursor_setIndex(this.state_cursor_validateIndex(
                        this.cursorIndex - 1));
                }
                return;
            case 'ArrowRight':
                if (!event.ctrlKey) { // If holding ctrl, don't preventDefault so the user can scroll horizontally?
                    event.preventDefault();
                    this.state_cursor_setIndex(this.state_cursor_validateIndex(
                        this.cursorIndex));

                    // TODO: 'ArrowRight' when the cursor is on a valid item but isn't part of the virtualization result.

                    // See comment "Awkward explicit inlining of 'this.indexItemTo_ringBufferIndexItem'" for more information.
                    let ringBufferIndexItem = ((this.cursorIndex)) - this.virtualIndex_ofScrollTop;
                    if (ringBufferIndexItem >= this.ringBufferLength || ringBufferIndexItem < 0) ringBufferIndexItem = -1;
                    else ringBufferIndexItem = (ringBufferIndexItem + this.ringBufferIndexZero) % this.virtualCount;

                    if (ringBufferIndexItem < 0) return;
                    return this.director.tvd_arrowRight_async(this.ringBuffer[ringBufferIndexItem], this.cursorIndex);
                }
                return;
            case 'ArrowLeft':
            	if (!event.ctrlKey) { // If holding ctrl, don't preventDefault so the user can scroll horizontally?
                    event.preventDefault();
                    this.state_cursor_setIndex(this.state_cursor_validateIndex(
                        this.cursorIndex));
                    
                    // See comment "Awkward explicit inlining of 'this.indexItemTo_ringBufferIndexItem'" for more information.
                    let ringBufferIndexItem = ((this.cursorIndex)) - this.virtualIndex_ofScrollTop;
                    if (ringBufferIndexItem >= this.ringBufferLength || ringBufferIndexItem < 0) ringBufferIndexItem = -1;
                    else ringBufferIndexItem = (ringBufferIndexItem + this.ringBufferIndexZero) % this.virtualCount;

                    if (ringBufferIndexItem < 0) return;
                    return this.director.tvd_arrowLeft_async(this.ringBuffer[ringBufferIndexItem], this.cursorIndex);
                }
            	return;
            case ' ':
            case 'Enter':
                event.preventDefault();
                this.state_cursor_setIndex(this.state_cursor_validateIndex(
                    this.cursorIndex));
                
                // See comment "Awkward explicit inlining of 'this.indexItemTo_ringBufferIndexItem'" for more information.
                let ringBufferIndexItem = ((this.cursorIndex)) - this.virtualIndex_ofScrollTop;
                if (ringBufferIndexItem >= this.ringBufferLength || ringBufferIndexItem < 0) ringBufferIndexItem = -1;
                else ringBufferIndexItem = (ringBufferIndexItem + this.ringBufferIndexZero) % this.virtualCount;

                if (ringBufferIndexItem < 0) return;
                return this.director.tvd_onkeydown_async(this.ringBuffer[ringBufferIndexItem], this.cursorIndex, event.key);
        }
    }

    TREEVIEW_render_do_Resize() {
        this.measureBaseElement();

        this.boundingClientRect = null;
        this.ensure_boundingClientRect();
        this.TREEVIEW_render_do_FullReset();
    }

    /**
     * TODO: intra-app resizes or movements will also invoke this; i.e.: if a list is shown in a dialog and the dialog is resized or moved.
     */
    event_windowResize() {
        this.TREEVIEW_render_request(TREEVIEWrenderKind_Resize);
    }

    event_scroll() {
        this.scrollLeft = this.scrollViewport.scrollLeft;
        this.scrollTop = this.scrollViewport.scrollTop;
        this.treeViewComponent_v2_staticRunner.TreeViewComponent_v2_render_request(TREEVIEWrenderKind_Scroll, this.runnerId);
    }

    ensure_boundingClientRect() {
        if (!this.boundingClientRect) {
            this.boundingClientRect = this.rootElement.getBoundingClientRect();
            this.virtualCount = Math.ceil(this.rootElement.offsetHeight / this.itemHeightNumber);
        }
    }

    TREEVIEW_render_do_Cursor(index) {
        // Determine the number without modifying styles so you can use this variable to determine the need to scroll into view without synchronous layout.
        this.cursorTranslateYNumber = this.cursorIndex * this.itemHeightNumber;

        // Preferably this hasn't changed thus the function immediately just returns.
        this.ensure_boundingClientRect();
        
        // If no UI modifications were made prior that are still pending this might avoid a synchronous layout.
        // TODO: If you touch the transform style first... I don't know what would happen it is a GPU related style... so I'm unsure.
        //
        if (this.cursorTranslateYNumber + (2 * this.itemHeightNumber) > this.scrollTop + this.boundingClientRect.height) {
            let currentBottom = this.scrollTop + this.boundingClientRect.height;
            let changeToMakeBottomTouch = this.cursorTranslateYNumber - currentBottom;
            let entireValueToScrollBy = changeToMakeBottomTouch + (2 * this.itemHeightNumber);
            this.scrollViewport.scrollBy(0, entireValueToScrollBy);
        }
        else if (this.cursorTranslateYNumber < this.scrollTop) {
            this.scrollViewport.scrollBy(0, this.cursorTranslateYNumber - this.scrollTop);
        }

        // transform last for optimal state flagging of the modified DOM element
        this.cursorElement.style.transform = `translateY(${this.cursorTranslateYNumber}px)`;
    }

    /**
     * if (this.cursorIndex === index) return;
     * 
     * @param {*} index 
     */
    state_cursor_setIndex(index) {
        if (this.cursorIndex === index) return;
        this.cursorIndex = index;
        this.TREEVIEW_render_request(TREEVIEWrenderKind_Cursor);
    }

    /**
     * if (this.cursorIndex === index) return;
     * 
     * @param {*} indexItem 
     */
    state_cursor_validateIndex(indexItem) {
        if (indexItem >= this.director.tvd_getTotalCount()) {
            indexItem = this.director.tvd_getTotalCount() - 1;
        }
        if (indexItem < 0) {
            indexItem = 0;
        }
        return indexItem;
    }

    measureBaseElement() {
        this.lastReadNumber_offsetWidth = Math.floor(this.rootElement.offsetWidth);
        this.lastReadNumber_offsetHeight = Math.floor(this.rootElement.offsetHeight);
    }

    /*
    TODO: The TreeView after you resize it, you can continually scroll down and it keeps replacing more and more '~' lines
          even if you've scrolled through everything already.
          This is probably some kind of rounding error?
          It porbably happens regardless of whether you resized
          and more-so that you just happen to have hit the perfect height for it to happen?
    */

    // tvnl_

    /**
     * Does not clear the information, only sets 'this.count' to '0'.
     */
    clear() {
        this.countAbstract = 0;
    }

    /**
     * TODO: Rename all of these because you're actually reading the data into a global variable and this name replicates an API that returns a value so it is confusing.
     * 
     * @param {TreeViewNode} trackedSyntax a place to read the data into, since it is stored as just int32 data (not the class)
     * @returns {TrackedSyntax}
     */
    getElementAt(index_abstract) {
        let index_literal = index_abstract * this.fieldCount;
        BYTES[byteTreeView_byteret_pooledNode_nodeKind] = this.dataLiteral[index_literal + this.nodeKindOffset];
        INTS[fTreeView_poolret_pooledNode_key] = this.dataLiteral[index_literal + this.keyOffset];
        INTS[fTreeView_poolret_pooledNode_depth] = this.dataLiteral[index_literal + this.depthOffset];
    }

    getKey(index_abstract) {
        return this.dataLiteral[(index_abstract * this.fieldCount) + this.keyOffset];
    }

    /**
     * TODO: This function has the 'index_abstract' as the first parameter,
     * meanwhile 'getElementAt(...)' takes this as second parameter.
     * A decision on a consistent position needs to be made.
     * @param {number} index_abstract 
     * @param {number} key 
     */
    setKey(index_abstract, key) {
        this.dataLiteral[(index_abstract * this.fieldCount) + this.keyOffset] = key;
    }
    
    getDepth(index_abstract) {
        return this.dataLiteral[(index_abstract * this.fieldCount) + this.depthOffset];
    }
    
    /**
     * TODO: This function has the 'index_abstract' as the first parameter,
     * meanwhile 'getElementAt(...)' takes this as second parameter.
     * A decision on a consistent position needs to be made.
     * @param {number} index_abstract 
     * @param {number} depth 
     */
    setDepth(index_abstract, depth) {
        this.dataLiteral[(index_abstract * this.fieldCount) + this.depthOffset] = depth;
    }
    
    /**
     * TODO: This function has the 'index_abstract' as the first parameter,
     * meanwhile 'getElementAt(...)' takes this as second parameter.
     * A decision on a consistent position needs to be made.
     * @param {number} index_abstract 
     * @param {number} nodeKind 
     */
    setNodeKind(index_abstract, nodeKind) {
        this.dataLiteral[(index_abstract * this.fieldCount) + this.nodeKindOffset] = nodeKind;
    }

    insert(index_abstract, nodeKind, key, depth) {
        this.ensureCapacityForInsertion(index_abstract, 1);

        let index_literal = index_abstract * this.fieldCount;

        if (index_abstract !== this.countAbstract) {
            this.copyTo(this.dataLiteral, index_abstract, this.dataLiteral, index_abstract + 1, this.countAbstract - index_abstract);
        }

        this.dataLiteral[index_literal + this.nodeKindOffset] = nodeKind;
        this.dataLiteral[index_literal + this.keyOffset] = key;
        this.dataLiteral[index_literal + this.depthOffset] = depth;

        this.countAbstract++;
    }

    /**
     * Does not clear trailing information.
     * 
     * count === 0 immediately returns
     */
    removeAt(index_abstract, count_abstract) {

        if (index_abstract > this.countAbstract) { throw new Error('removeAt(...): index_abstract > this.count_abstract'); }
        if (index_abstract + count_abstract > this.countAbstract) { throw new Error('removeAt(...): index_abstract + count_abstract > this.count_abstract'); }
        if (count_abstract === 0) { return; }

        if (index_abstract + count_abstract === this.countAbstract) {
            let shiftableCount_abstract = this.countAbstract - (index_abstract + count_abstract);
            if (shiftableCount_abstract > 0) {
                this.copyTo(
                    this.dataLiteral,
                    index_abstract + count_abstract,
                    this.dataLiteral,
                    index_abstract,
                    shiftableCount_abstract);
            }
        }
        else {
            this.copyTo(
                this.dataLiteral,
                index_abstract + count_abstract,
                this.dataLiteral,
                index_abstract,
                this.countAbstract - (index_abstract + count_abstract));
        }

        this.countAbstract -= count_abstract;
    }

    ensureCapacityForInsertion(index_abstract, count_abstract) {
        // TODO: sparse insertions?
        const requiredCapacity_literal = Math.max((this.countAbstract + count_abstract) * this.fieldCount, index_abstract * this.fieldCount);
        
        // If we already have enough capacity, do absolutely nothing
        if (requiredCapacity_literal <= this.capacityLiteral) {
            return;
        }

        // Calculate the new capacity by doubling until it fits
        let capacityNew_literal = this.capacityLiteral || 1; // Prevent infinite loops if capacity is 0
        let capacityNew_abstract = this.capacityAbstract || 1; // Prevent infinite loops if capacity is 0
        while (capacityNew_literal < requiredCapacity_literal) {
            capacityNew_literal *= 2;
            capacityNew_abstract *= 2;
        }

        // Safety check against integer overflow / negative bounds
        if (capacityNew_literal < this.capacityLiteral) {
            throw new Error('ensureCapacityForInsertion(...): Capacity overflowed or went negative');
        }

        // Allocate and copy EXACTLY ONCE
        let dataNew_literal = new Uint32Array(capacityNew_literal);
        this.copyTo(this.dataLiteral, 0, dataNew_literal, 0, this.countAbstract);
        
        // Commit the changes to your global/module state
        this.dataLiteral = dataNew_literal;
        this.capacityLiteral = capacityNew_literal;
        this.capacityAbstract = capacityNew_abstract;
    }

    /**
     * inclusive/exclusive
     */
    copyTo(dataSource_literal, sourceStart_abstract, dataDestination_literal, destinationStart_abstract, length_abstract) {

        if (dataSource_literal === dataDestination_literal) {
            if (dataSource_literal !== this.dataLiteral) {
                throw new Error('dataSource_literal === dataDestination_literal ; but dataSource_literal !== this.data_literal');
            }

            // TODO: use 'copyWithin' method here and other such locations

            let distance_abstract = destinationStart_abstract - sourceStart_abstract;

            if (distance_abstract > 0) {
                for (var i_abstract = sourceStart_abstract + length_abstract - 1; i_abstract >= sourceStart_abstract; i_abstract--) {
                    let iplusd_abstract = i_abstract + distance_abstract;
                    let iplusd_literal = iplusd_abstract * this.fieldCount;
                    let i_literal = i_abstract * this.fieldCount;
                    this.dataLiteral[iplusd_literal + this.nodeKindOffset] = this.dataLiteral[i_literal + this.nodeKindOffset];
                    this.dataLiteral[iplusd_literal + this.keyOffset] = this.dataLiteral[i_literal + this.keyOffset];
                    this.dataLiteral[iplusd_literal + this.depthOffset] = this.dataLiteral[i_literal + this.depthOffset];
                }
            }
            else {
                for (var i_abstract = destinationStart_abstract; i_abstract < this.countAbstract; i_abstract++) {
                    let iminusd_abstract = i_abstract - distance_abstract;
                    let iminusd_literal = iminusd_abstract * this.fieldCount;
                    let i_literal = i_abstract * this.fieldCount;
                    this.dataLiteral[i_literal + this.nodeKindOffset] = this.dataLiteral[iminusd_literal + this.nodeKindOffset];
                    this.dataLiteral[i_literal + this.keyOffset] = this.dataLiteral[iminusd_literal + this.keyOffset];
                    this.dataLiteral[i_literal + this.depthOffset] = this.dataLiteral[iminusd_literal + this.depthOffset];
                }
            }
        }
        else {
            // TODO: use 'set' method here and other such locations
            for (var i_abstract = 0; i_abstract < length_abstract; i_abstract++) {
                let dSplusi_abstract = destinationStart_abstract + i_abstract;
                let dSplusi_literal = dSplusi_abstract * this.fieldCount;
                let sSplusi_abstract = sourceStart_abstract + i_abstract;
                let sSplusi_literal = sSplusi_abstract * this.fieldCount;
                dataDestination_literal[dSplusi_literal + this.nodeKindOffset] = dataSource_literal[sSplusi_literal + this.nodeKindOffset];
                dataDestination_literal[dSplusi_literal + this.keyOffset] = dataSource_literal[sSplusi_literal + this.keyOffset];
                dataDestination_literal[dSplusi_literal + this.depthOffset] = dataSource_literal[sSplusi_literal + this.depthOffset];
            }
        }
    }
}

/*
########################################################################
# Awkward explicit inlining of 'this.indexItemTo_ringBufferIndexItem': #
########################################################################

// TODO: This is an awkward explicit inlining of 'this.indexItemTo_ringBufferIndexItem'...
// ...the initial declaration of 'let ringBufferIndex' is assigned what I refer to as the "virtualIndex"
// but 'ringBufferIndex' is the output of the function, and a 'virtualIndex' variable is only needed temporarily
// for the calculation. So by storing the 'virtualIndex' in 'ringBufferIndex' at the start I skip a variable declaration.
|
(retrospective comment): I see what I was doing.
It isn't just the single variable declaration.
You can't do the modulo logic UNLESS the virtual index is valid (that the line of text is actually being drawn in the UI).
BUT I think this was an assumption on my end.
I wonder if the modulo math would work out such that I could...
well I guess I'd need to add an if to verify that the modulo math went correctly
thus the same thing happens but now I can't just re-use that I'm virtual index first then you're safe thus the if else part...
*/
