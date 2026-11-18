import {APP_lineHeightStringWithPx} from "./applicationRendererRoot.js"

export const CONST_AUTOCOMPLETE_topPadding = 4;

let AUTOCOMPLETE_pending_lspResult = null;
// I don't think 'slice' is in LSP specification but I need to start like this cause it is only way I'll get something "initially working".
let AUTOCOMPLETE_items_slice = null;

const AUTOCOMPLETErenderKind = Object.freeze({
    None: 0,
    Show: 1,
    Hide: 2,
    CursorSet: 3,
    CreateLines: 4,
    Scroll: 5,
});

class Autocomplete {
    constructor() {
        let exists = false;
        let isRenderPending = false;
        let rect_isNull = true;
        let isCheckingTrailingEdge = false;
        let scrollIsFetchingData = false;
        let queueHead = 0;
        let queueTail = 0;

        // I don't think 'slice' is in LSP specification but I need to start like this cause it is only way I'll get something "initially working".
        /** TODO: This isn't used only set */
        let items_slice_start = 0;
        /** TODO: This isn't used only set */
        let items_slice_end = 0;
        let items_totalLength = 0;

        let cursorIndex = 0;

        let rectHeight = 0;
        let rectLeft = 0;
        /** TODO: This isn't used only set, but it probably will be used for mouse events just that they're not written yet? */
        let rectTop = 0;

        let sliceVirtualIndex_SLICE = 0;
        let sliceVirtualCount_SLICE = 0;
        let sliceRingBufferIndexZero_SLICE = 0;

        let virtualCount = 0;
        let virtualIndex = 0;
        let ringBufferIndexZero = 0;

        let scrollTop = 0;

        let isCheckingTrailingEdgeTimeoutId = 0;
    }
}

let AUTOCOMPLETEElement = null;
let AUTOCOMPLETE_scroll_viewport = null;
let AUTOCOMPLETE_text = null;
let AUTOCOMPLETE_ringBuffer = null;

let AUTOCOMPLETE_scrollLeft = 0;

let AUTOCOMPLETE_lastSeenFilter = null;
let AUTOCOMPLETE_lastSeen_totalLength_SLICE = 0;

function AUTOCOMPLETE_render_request(renderKind) {
    if (f.BYTES[byteAUTOCOMPLETE_queueHead] !== f.BYTES[byteAUTOCOMPLETE_queueTail]) {
        const lastAbsoluteIndex = f.OFFSET_AUTOCOMPLETE + ((f.BYTES[byteAUTOCOMPLETE_queueTail] - 1) & f.UI_SLOT_MASK);
        if (f.MASTER_RENDER_BUFFER[lastAbsoluteIndex] === renderKind) {
            return;
        }
    }

    const absoluteIndex = f.OFFSET_AUTOCOMPLETE + (f.BYTES[byteAUTOCOMPLETE_queueTail] & f.UI_SLOT_MASK);
    f.MASTER_RENDER_BUFFER[absoluteIndex] = renderKind;
    f.BYTES[byteAUTOCOMPLETE_queueTail]++;
    
    if (f.BYTES[byteAUTOCOMPLETE_isRenderPending] === 0) {
        f.BYTES[byteAUTOCOMPLETE_isRenderPending] = 1;
        requestAnimationFrame(AUTOCOMPLETE_render_do);
    }
}

function AUTOCOMPLETE_render_do() {
    while (f.BYTES[byteAUTOCOMPLETE_queueHead] !== f.BYTES[byteAUTOCOMPLETE_queueTail]) {
        // Uses the exact same masking logic, but reads from the higher memory region
        const absoluteIndex = f.OFFSET_AUTOCOMPLETE + (f.BYTES[byteAUTOCOMPLETE_queueHead] & f.UI_SLOT_MASK);
        const renderKind = f.MASTER_RENDER_BUFFER[absoluteIndex];
        f.BYTES[byteAUTOCOMPLETE_queueHead]++; 

        switch (renderKind) {
            case AUTOCOMPLETErenderKind_Show:
                AUTOCOMPLETE_render_do_show();
                break;
            case AUTOCOMPLETErenderKind_Hide:
                AUTOCOMPLETE_render_do_hide();
                break;
            case AUTOCOMPLETErenderKind_CursorSet:
                AUTOCOMPLETE_cursor_render_set();
                break;
            case AUTOCOMPLETErenderKind_CreateLines:
                AUTOCOMPLETE_render_create_lines();
                break;
            case AUTOCOMPLETErenderKind_Scroll:
                AUTOCOMPLETE_events_scroll_render();
                break;
        }
    }
    f.BYTES[byteAUTOCOMPLETE_isRenderPending] = 0;
}

function AUTOCOMPLETE_render_create_lines(AUTOCOMPLETE_itemList) {

    if (!AUTOCOMPLETE_itemList) {
        AUTOCOMPLETE_itemList = document.getElementById('AUTOCOMPLETE_itemList');
        if (!AUTOCOMPLETE_itemList) return; // TODO: silent error
    }

    // TODO: minus CONST_AUTOCOMPLETE_topPadding
    f.INTS[fAUTOCOMPLETE_virtualCount] = Math.floor(f.INTS[fAUTOCOMPLETE_rectHeight] / f.fAPP_lineHeight);
    f.INTS[fAUTOCOMPLETE_virtualIndex] = 0;
    f.INTS[fAUTOCOMPLETE_ringBufferIndexZero] = 0;
    f.INTS[fAUTOCOMPLETE_scrollTop] = 0;

    f.INTS[fAUTOCOMPLETE_cursorIndex] = 0;

    let appHeightCssAttributeValue = `${f.fAPP_lineHeight}px`;

    AUTOCOMPLETE_itemList.innerHTML = '';

    let verticalOffset = CONST_AUTOCOMPLETE_topPadding;

    let widthAttributeValueNumber = Math.ceil((f.INTS[fAUTOCOMPLETE_WIDTH_NODE_DRAWN_NUMBER_IN_CH_UNITS_NO_PADDING] + 2/*padding*/) * f.fEXPLORER_firstSpanWidthValue);
    let widthAttributeValueString = widthAttributeValueNumber + 'px';

    for (let i = 0; i < f.INTS[fAUTOCOMPLETE_virtualCount]; i++) {
        let div = document.createElement('div');
        div.style.height = appHeightCssAttributeValue;
        div.style.whiteSpace = 'nowrap';
        div.style.position = 'absolute';
        div.style.left = '0px';
        div.style.top = '0px';

        // TODO: Does treeViewComponent.js specify a:
        // - [ ] left
        // - [ ] top
        // |
        // for the nodes, it needs to even if 0 so the browser receives explicit instructions rather than trying to static place and it "happens" to end up at 0,0.

        div.style.width = widthAttributeValueString;
        AUTOCOMPLETE_itemList.append(div);

        div.style.top = `${verticalOffset}px`;
        verticalOffset += f.fAPP_lineHeight;
    }

    AUTOCOMPLETE_ringBuffer = Array.from(AUTOCOMPLETE_itemList.children);
}

function AUTOCOMPLETE_render_RESET_lines(AUTOCOMPLETE_itemList) {

    if (!AUTOCOMPLETE_itemList) {
        AUTOCOMPLETE_itemList = document.getElementById('AUTOCOMPLETE_itemList');
        if (!AUTOCOMPLETE_itemList) return; // TODO: silent error
    }

    AUTOCOMPLETE_ensure_boundingClientRect();

    // TODO: minus CONST_AUTOCOMPLETE_topPadding
    f.INTS[fAUTOCOMPLETE_virtualCount] = Math.floor(f.INTS[fAUTOCOMPLETE_rectHeight] / f.fAPP_lineHeight);
    f.INTS[fAUTOCOMPLETE_virtualIndex] = 0;
    f.INTS[fAUTOCOMPLETE_ringBufferIndexZero] = 0;
    f.INTS[fAUTOCOMPLETE_scrollTop] = 0;

    AUTOCOMPLETEElement.removeEventListener('scroll', AUTOCOMPLETE_events_scroll_receive, { passive: true });
    AUTOCOMPLETE_scroll_viewport.scrollTop = 0;
    AUTOCOMPLETEElement.addEventListener('scroll', AUTOCOMPLETE_events_scroll_receive, { passive: true });
    f.INTS[fAUTOCOMPLETE_cursorIndex] = 0;

    let verticalOffset = CONST_AUTOCOMPLETE_topPadding;

    for (let i = 0; i < f.INTS[fAUTOCOMPLETE_virtualCount]; i++) {
        
        let div = AUTOCOMPLETE_ringBuffer[i];

        // TODO: Does treeViewComponent.js specify a:
        // - [ ] left
        // - [ ] top
        // |
        // for the nodes, it needs to even if 0 so the browser receives explicit instructions rather than trying to static place and it "happens" to end up at 0,0.

        div.style.top = `${verticalOffset}px`;
        verticalOffset += f.fAPP_lineHeight;
    }
}

function AUTOCOMPLETE_render_do_show() {

    // TODO: The code as is already isn't guaranteed to not race condition with the lsp requests
    // so this continues failing to avoid race condition, but now if the lsp throws an error you don't get locked out forever.
    // (the reason specfically I think relates to when you change a file i.e.: changing a file can race condition regardless of this being forced to false)
    // (UGH not changing a file I'm gonna pass out I'm almost done but I mean the changing the autocomplete menu or some such)
    f.BYTES[byteAUTOCOMPLETE_scrollIsFetchingData] = 0;

    let local_AUTOCOMPLETEElement;
    let AUTOCOMPLETE_itemList;
    let AUTOCOMPLETE_scrollbar_space_generator;

    if (f.BYTES[byteAUTOCOMPLETE_exists]) {
        local_AUTOCOMPLETEElement = document.getElementById('AUTOCOMPLETE');

        AUTOCOMPLETE_itemList = document.getElementById('AUTOCOMPLETE_itemList');
        if (!AUTOCOMPLETE_itemList) {
            throw new Error();
        }

        AUTOCOMPLETE_scrollbar_space_generator = document.getElementById('AUTOCOMPLETE_scrollbar_space_generator');
        if (!AUTOCOMPLETE_scrollbar_space_generator) {
            throw new Error();
        }

        // This is why I worry about doing a bool check in the other UIs
        // I worry about the state getting corrupted somehow.
        //
        // And then if it is truly meaningful from an optimization standpoint such as the scrolling of the editor
        // I take on the state corruption risk, otherwise I just defensively handle it.
        if (!local_AUTOCOMPLETEElement) {
            f.BYTES[byteAUTOCOMPLETE_exists] = 0;
            AUTOCOMPLETE_render_do_show();
            return;
        }

        AUTOCOMPLETE_render_RESET_lines(AUTOCOMPLETE_itemList);
    }
    else {
        local_AUTOCOMPLETEElement = document.createElement('div');
        local_AUTOCOMPLETEElement.id = 'AUTOCOMPLETE';
        local_AUTOCOMPLETEElement.className = 'unselectable';
        local_AUTOCOMPLETEElement.style.left = '0px';
        local_AUTOCOMPLETEElement.style.top = '0px';
        local_AUTOCOMPLETEElement.tabIndex = 0;

        AUTOCOMPLETE_scroll_viewport = document.createElement('div');
        AUTOCOMPLETE_scroll_viewport.id = 'AUTOCOMPLETE_scroll_viewport';
        AUTOCOMPLETE_scrollbar_space_generator = document.createElement('div');
        AUTOCOMPLETE_scrollbar_space_generator.id = 'AUTOCOMPLETE_scrollbar_space_generator';
        AUTOCOMPLETE_scroll_viewport.appendChild(AUTOCOMPLETE_scrollbar_space_generator);
        local_AUTOCOMPLETEElement.appendChild(AUTOCOMPLETE_scroll_viewport);

        //AUTOCOMPLETE_virtualization = document.createElement('div');
        //AUTOCOMPLETE_virtualization.id = 'AUTOCOMPLETE_virtualization';
        //local_AUTOCOMPLETEElement.appendChild(AUTOCOMPLETE_virtualization);

        const AUTOCOMPLETE_visual_canvas = document.createElement('div');
        AUTOCOMPLETE_visual_canvas.id = 'AUTOCOMPLETE_visual_canvas';
        AUTOCOMPLETE_text = document.createElement('div');
        AUTOCOMPLETE_text.id = 'AUTOCOMPLETE_text';
        AUTOCOMPLETE_visual_canvas.appendChild(AUTOCOMPLETE_text);
        local_AUTOCOMPLETEElement.appendChild(AUTOCOMPLETE_visual_canvas);

        let AUTOCOMPLETE_cursor = document.createElement('div');
        AUTOCOMPLETE_cursor.id = 'AUTOCOMPLETE_cursor';
        AUTOCOMPLETE_cursor.style.height = APP_lineHeightStringWithPx;
        AUTOCOMPLETE_cursor.style.lineHeight = APP_lineHeightStringWithPx;
        AUTOCOMPLETE_text.appendChild(AUTOCOMPLETE_cursor);

        AUTOCOMPLETE_itemList = document.createElement('div');
        AUTOCOMPLETE_itemList.id = 'AUTOCOMPLETE_itemList';
        AUTOCOMPLETE_text.appendChild(AUTOCOMPLETE_itemList);

        document.body.appendChild(local_AUTOCOMPLETEElement);
        let rect = local_AUTOCOMPLETEElement.getBoundingClientRect();
        f.INTS[fAUTOCOMPLETE_rectHeight] = Math.floor(rect.height);
        f.INTS[fAUTOCOMPLETE_rectLeft] = rect.left;
        f.INTS[fAUTOCOMPLETE_rectTop] = rect.top;
        f.BYTES[byteAUTOCOMPLETE_rect_isNull] = 0;

        AUTOCOMPLETE_render_create_lines(AUTOCOMPLETE_itemList);

        AUTOCOMPLETE_events_add(local_AUTOCOMPLETEElement);

        AUTOCOMPLETEElement = local_AUTOCOMPLETEElement;
    }
    
    let lspResult = AUTOCOMPLETE_pending_lspResult;
    AUTOCOMPLETE_pending_lspResult = null;
    AUTOCOMPLETE_items_slice = lspResult.items;
    f.INTS[fAUTOCOMPLETE_items_slice_start] = lspResult.itemsStart;
    f.INTS[fAUTOCOMPLETE_items_slice_end] = lspResult.itemsEnd;
    f.INTS[fAUTOCOMPLETE_items_totalLength] = lspResult.totalLength;

    f.INTS[fAUTOCOMPLETE_WIDTH_NODE_DRAWN_NUMBER_IN_CH_UNITS_NO_PADDING] = 0;

    // TODO: This doesn't need mail.ceil but perhaps add it to ensure things?
    let itemHeightTotalNumber = f.INTS[fAUTOCOMPLETE_items_totalLength] * f.fAPP_lineHeight + CONST_AUTOCOMPLETE_topPadding;
    AUTOCOMPLETE_scrollbar_space_generator.style.height = itemHeightTotalNumber + 'px';

    f.BYTES[byteAUTOCOMPLETE_exists] = 1;

    //local_AUTOCOMPLETEElement.focus();

    AUTOCOMPLETE_cursor_render_set();

    f.INTS[fAUTOCOMPLETE_virtualIndex] = f.INTS[fAUTOCOMPLETE_virtualCount];
    AUTOCOMPLETE_events_scroll_render();
    f.INTS[fAUTOCOMPLETE_virtualIndex] = 0;
}

function AUTOCOMPLETE_show(lspResult) {
    AUTOCOMPLETE_pending_lspResult = lspResult;
    AUTOCOMPLETE_render_request(AUTOCOMPLETErenderKind_Show);
}

function AUTOCOMPLETE_slice(lspResult) {

    f.BYTES[byteAUTOCOMPLETE_scrollIsFetchingData] = 0;
    if (f.INTS[fAUTOCOMPLETE_sliceVirtualIndex_SLICE] != f.INTS[fAUTOCOMPLETE_virtualIndex] ||
        f.INTS[fAUTOCOMPLETE_sliceVirtualCount_SLICE] != f.INTS[fAUTOCOMPLETE_virtualCount] ||
        f.INTS[fAUTOCOMPLETE_sliceRingBufferIndexZero_SLICE] != f.INTS[fAUTOCOMPLETE_ringBufferIndexZero]) {
            return;
    }

    let local_AUTOCOMPLETE_ringBuffer = AUTOCOMPLETE_ringBuffer;
    let local_AUTOCOMPLETE_ringBuffer_length = local_AUTOCOMPLETE_ringBuffer.length;

    let currentWIDTH_NODE_DRAWN_NUMBER_IN_CH_UNITS_NO_PADDING = f.INTS[fAUTOCOMPLETE_WIDTH_NODE_DRAWN_NUMBER_IN_CH_UNITS_NO_PADDING];
    let NEXT_WIDTH_NODE_DRAWN_NUMBER_IN_CH_UNITS_NO_PADDING = currentWIDTH_NODE_DRAWN_NUMBER_IN_CH_UNITS_NO_PADDING;

    let ringBufferIndex = f.INTS[fAUTOCOMPLETE_ringBufferIndexZero];
    let loopCount = 0;

    for (let i = 0; i < lspResult.items.length; i++) {
        loopCount++;
        let item = lspResult.items[i];
        let div = local_AUTOCOMPLETE_ringBuffer[ringBufferIndex];
        ringBufferIndex = (ringBufferIndex + 1) % local_AUTOCOMPLETE_ringBuffer_length;
        div.className = '';
        div.textContent = item.label;

        // TODO: Reduce drawn width under some circumstance too
        if (item.label.length > NEXT_WIDTH_NODE_DRAWN_NUMBER_IN_CH_UNITS_NO_PADDING) {
            NEXT_WIDTH_NODE_DRAWN_NUMBER_IN_CH_UNITS_NO_PADDING = item.label.length;
        }
    }

    for (; loopCount < f.INTS[fAUTOCOMPLETE_virtualCount]; loopCount++) {
        let div = local_AUTOCOMPLETE_ringBuffer[ringBufferIndex];
        ringBufferIndex = (ringBufferIndex + 1) % local_AUTOCOMPLETE_ringBuffer_length;
        div.className = '';
        div.textContent = '~';
    }

    if (NEXT_WIDTH_NODE_DRAWN_NUMBER_IN_CH_UNITS_NO_PADDING > currentWIDTH_NODE_DRAWN_NUMBER_IN_CH_UNITS_NO_PADDING) {
        f.INTS[fAUTOCOMPLETE_WIDTH_NODE_DRAWN_NUMBER_IN_CH_UNITS_NO_PADDING] = NEXT_WIDTH_NODE_DRAWN_NUMBER_IN_CH_UNITS_NO_PADDING;
        let widthAttributeValueNumber = Math.ceil((f.INTS[fAUTOCOMPLETE_WIDTH_NODE_DRAWN_NUMBER_IN_CH_UNITS_NO_PADDING] + 2/*padding*/) * f.fEXPLORER_firstSpanWidthValue);

        // This is actually more complicated you have to track whether you go above the minimum requirement lest you add 1 character over and over in width just to keep redrawing widths.
        //if (widthAttributeValueNumber < this.lastReadNumber_offsetWidth) {
        //    widthAttributeValueNumber = this.lastReadNumber_offsetWidth;
        //}
        //this.WIDTH_NODE_DRAWN_NUMBER_IN_CH_UNITS_NO_PADDING
        let widthAttributeValueString = widthAttributeValueNumber + 'px';

        let cursorElement = document.getElementById('AUTOCOMPLETE_cursor');
        if (cursorElement) {
            cursorElement.style.width = widthAttributeValueString;
        }

        for (let i = 0; i < local_AUTOCOMPLETE_ringBuffer_length; i++) {
            local_AUTOCOMPLETE_ringBuffer[i].style.width = widthAttributeValueString;
        }

        AUTOCOMPLETE_scrollbar_space_generator.style.width = widthAttributeValueString;
    }

    if (AUTOCOMPLETE_lastSeen_totalLength_SLICE !== lspResult.totalLength) {
        AUTOCOMPLETE_lastSeen_totalLength_SLICE = lspResult.totalLength;
        // TODO: This doesn't need mail.ceil but perhaps add it to ensure things?
        let itemHeightTotalNumber = AUTOCOMPLETE_lastSeen_totalLength_SLICE * f.fAPP_lineHeight + CONST_AUTOCOMPLETE_topPadding;
        AUTOCOMPLETE_scrollbar_space_generator.style.height = itemHeightTotalNumber + 'px';
    }
}

function AUTOCOMPLETE_render_do_hide() {
    const AUTOCOMPLETE = document.getElementById('AUTOCOMPLETE');
    if (AUTOCOMPLETE) {
        AUTOCOMPLETE_events_remove(AUTOCOMPLETE);
        AUTOCOMPLETE.remove();
        AUTOCOMPLETEElement = null;
        AUTOCOMPLETE_scroll_viewport.remove();
        AUTOCOMPLETE_scroll_viewport = null;
        AUTOCOMPLETE_text.remove();
        AUTOCOMPLETE_text = null;
        AUTOCOMPLETE_ringBuffer = null;
    }

    f.BYTES[byteAUTOCOMPLETE_exists] = 0;
}

function AUTOCOMPLETE_hide() {
    AUTOCOMPLETE_pending_lspResult = null;
    AUTOCOMPLETE_render_request(AUTOCOMPLETErenderKind_Hide);
}

function AUTOCOMPLETE_cursor_render_set() {
    if (!f.BYTES[byteAUTOCOMPLETE_exists]) return;
    
    let cursorElement = document.getElementById('AUTOCOMPLETE_cursor');

    // Determine the number without modifying styles so you can use this variable to determine the need to scroll into view without synchronous layout.
    let cursorTranslateYNumber = CONST_AUTOCOMPLETE_topPadding + (f.fAPP_lineHeight * f.INTS[fAUTOCOMPLETE_cursorIndex]);

    // Preferably this hasn't changed thus the function immediately just returns.
    if (f.BYTES[byteAUTOCOMPLETE_rect_isNull])
        AUTOCOMPLETE_ensure_boundingClientRect();
    
    // If no UI modifications were made prior that are still pending this might avoid a synchronous layout.
    // TODO: If you touch the transform style first... I don't know what would happen it is a GPU related style... so I'm unsure.
    //
    if (cursorTranslateYNumber + (2 * f.fAPP_lineHeight) > f.INTS[fAUTOCOMPLETE_scrollTop] + f.INTS[fAUTOCOMPLETE_rectHeight]) {
        let currentBottom = f.INTS[fAUTOCOMPLETE_scrollTop] + f.INTS[fAUTOCOMPLETE_rectHeight];
        let changeToMakeBottomTouch = cursorTranslateYNumber - currentBottom;
        let entireValueToScrollBy = changeToMakeBottomTouch + (2 * f.fAPP_lineHeight);
        AUTOCOMPLETE_scroll_viewport.scrollBy(0, entireValueToScrollBy);
    }
    else if (cursorTranslateYNumber < f.INTS[fAUTOCOMPLETE_scrollTop]) {
        AUTOCOMPLETE_scroll_viewport.scrollBy(0, cursorTranslateYNumber - f.INTS[fAUTOCOMPLETE_scrollTop]);
    }

    // transform last for optimal state flagging of the modified DOM element
    cursorElement.style.top = `${cursorTranslateYNumber}px`;
}

function AUTOCOMPLETE_cursor_do_set(cursorIndex) {
    f.INTS[fAUTOCOMPLETE_cursorIndex] = cursorIndex;
    AUTOCOMPLETE_render_request(AUTOCOMPLETErenderKind_CursorSet);
}

function AUTOCOMPLETE_cursor_validate(cursorIndex) {
    if (cursorIndex >= f.INTS[fAUTOCOMPLETE_items_totalLength]) {
        cursorIndex = f.INTS[fAUTOCOMPLETE_items_totalLength] - 1;
    }
    if (cursorIndex < 0) {
        cursorIndex = 0;
    }
    return cursorIndex;
}

function AUTOCOMPLETE_ensure_boundingClientRect() {
    if (f.BYTES[byteAUTOCOMPLETE_rect_isNull] && f.BYTES[byteAUTOCOMPLETE_exists]) {
        let rect = AUTOCOMPLETEElement.getBoundingClientRect();
        f.INTS[fAUTOCOMPLETE_rectHeight] = rect.height;
        f.INTS[fAUTOCOMPLETE_rectLeft] = rect.left;
        f.INTS[fAUTOCOMPLETE_rectTop] = rect.top;
        f.BYTES[byteAUTOCOMPLETE_rect_isNull] = 0;
    }
}

function AUTOCOMPLETE_events_add(AUTOCOMPLETEElement) {
    AUTOCOMPLETEElement.addEventListener('keydown', AUTOCOMPLETE_events_onkeydown);
    AUTOCOMPLETE_scroll_viewport.addEventListener('scroll', AUTOCOMPLETE_events_scroll_receive, { passive: true });
    AUTOCOMPLETEElement.addEventListener('blur', AUTOCOMPLETE_events_blur_receive);
    window.addEventListener('resize', AUTOCOMPLETE_events_resize);
}

function AUTOCOMPLETE_events_remove(AUTOCOMPLETEElement) {
    AUTOCOMPLETEElement.removeEventListener('keydown', AUTOCOMPLETE_events_onkeydown);
    AUTOCOMPLETE_scroll_viewport.removeEventListener('scroll', AUTOCOMPLETE_events_scroll_receive, { passive: true });
    AUTOCOMPLETEElement.removeEventListener('blur', AUTOCOMPLETE_events_blur_receive);
    window.removeEventListener('resize', AUTOCOMPLETE_events_resize);
}

function AUTOCOMPLETE_events_resize() {
    f.BYTES[byteAUTOCOMPLETE_rect_isNull] = 1;
}

function AUTOCOMPLETE_events_blur_receive() {
    AUTOCOMPLETE_hide();
}

function AUTOCOMPLETE_events_scroll_receive(event) {
    // it might be better as event.target.scrollTop or something... or????
    //
    // Something is still breaking
    // 
    f.INTS[fAUTOCOMPLETE_scrollTop] = AUTOCOMPLETE_scroll_viewport.scrollTop;
    AUTOCOMPLETE_scrollLeft = AUTOCOMPLETE_scroll_viewport.scrollLeft;
    AUTOCOMPLETE_render_request(AUTOCOMPLETErenderKind_Scroll);
}

function AUTOCOMPLETE_events_scroll_render() {

    clearTimeout(f.INTS[fAUTOCOMPLETE_isCheckingTrailingEdgeTimeoutId]);
    f.INTS[fAUTOCOMPLETE_isCheckingTrailingEdgeTimeoutId] = setTimeout(AUTOCOMPLETE_events_scroll_render_trailingEdgeDo, 300);

    let prevVli = f.INTS[fAUTOCOMPLETE_virtualIndex];

    AUTOCOMPLETE_text.style.transform = `translate3d(-${AUTOCOMPLETE_scrollLeft}px, -${f.INTS[fAUTOCOMPLETE_scrollTop]}px, 0)`;

    // TODO: minus CONST_AUTOCOMPLETE_topPadding
    let currVli = Math.floor(f.INTS[fAUTOCOMPLETE_scrollTop] / f.fAPP_lineHeight);

    f.INTS[fAUTOCOMPLETE_virtualIndex] = currVli;

    let diff = currVli - prevVli;
    if (diff === 0) return;

    let lowerBound;
    let upperBound;
    let ringBufferIndex;

    let local_AUTOCOMPLETE_ringBuffer = AUTOCOMPLETE_ringBuffer;
    let local_AUTOCOMPLETE_ringBuffer_length = local_AUTOCOMPLETE_ringBuffer.length;
    let local_AUTOCOMPLETE_items_totalLength = f.INTS[fAUTOCOMPLETE_items_totalLength];

    if (diff > 0 && diff < f.INTS[fAUTOCOMPLETE_virtualCount]) {
        lowerBound = prevVli + f.INTS[fAUTOCOMPLETE_virtualCount];
        upperBound = lowerBound + diff;

        ringBufferIndex = f.INTS[fAUTOCOMPLETE_ringBufferIndexZero];

        f.INTS[fAUTOCOMPLETE_ringBufferIndexZero] = (ringBufferIndex + diff) % local_AUTOCOMPLETE_ringBuffer_length;
    }
    else if (diff < 0 && ((diff *= -1) < f.INTS[fAUTOCOMPLETE_virtualCount])) {
        lowerBound = currVli;
        upperBound = lowerBound + diff;

        // TODO: This can be simplified to a modulo operation.
        let lastIndex = f.INTS[fAUTOCOMPLETE_ringBufferIndexZero] === 0
            ? local_AUTOCOMPLETE_ringBuffer_length - 1
            : f.INTS[fAUTOCOMPLETE_ringBufferIndexZero] - 1;

        f.INTS[fAUTOCOMPLETE_ringBufferIndexZero] = (lastIndex - (diff - 1) + local_AUTOCOMPLETE_ringBuffer_length) % local_AUTOCOMPLETE_ringBuffer_length;

        ringBufferIndex = f.INTS[fAUTOCOMPLETE_ringBufferIndexZero];
    }
    else {
        lowerBound = currVli;
        upperBound = currVli + f.INTS[fAUTOCOMPLETE_virtualCount];
        ringBufferIndex = f.INTS[fAUTOCOMPLETE_ringBufferIndexZero];
    }

    let verticalOffset = CONST_AUTOCOMPLETE_topPadding + (lowerBound * f.fAPP_lineHeight);

    ringBufferIndex--; // The 0th loop will increment somewhat awkwardly. This decrement avoids that.

    for (let i = lowerBound; i < upperBound; i++) {

        ringBufferIndex = (ringBufferIndex + 1) % local_AUTOCOMPLETE_ringBuffer_length;

        let div = local_AUTOCOMPLETE_ringBuffer[ringBufferIndex];
        
        if (i >= local_AUTOCOMPLETE_items_totalLength) {
            div.textContent = '~';
        }
        else {
            div.className = 'eN';
            div.textContent = '...';
        }
        
        div.style.top = `${verticalOffset}px`;
        verticalOffset += f.fAPP_lineHeight;
    }
}

function AUTOCOMPLETE_events_scroll_render_trailingEdgeDo(filter) {
    if (!f.BYTES[byteAUTOCOMPLETE_scrollIsFetchingData]) {
        f.INTS[fAUTOCOMPLETE_sliceVirtualIndex_SLICE] = f.INTS[fAUTOCOMPLETE_virtualIndex];
        f.INTS[fAUTOCOMPLETE_sliceVirtualCount_SLICE] = f.INTS[fAUTOCOMPLETE_virtualCount];
        f.INTS[fAUTOCOMPLETE_sliceRingBufferIndexZero_SLICE] = f.INTS[fAUTOCOMPLETE_ringBufferIndexZero];
        f.BYTES[byteAUTOCOMPLETE_scrollIsFetchingData] = 1;

        if (filter === undefined) {
            if (AUTOCOMPLETE_lastSeenFilter === null && editor.cursor_textInsertionBufferCount > 0) {
                AUTOCOMPLETE_lastSeenFilter = EDI_autocomplete_get_filter();
            }
            else if (AUTOCOMPLETE_lastSeenFilter !== null && editor.cursor_textInsertionBufferCount === 0) {
                AUTOCOMPLETE_lastSeenFilter = null;
            }

            filter = AUTOCOMPLETE_lastSeenFilter;
        }

        //window.myAPI.editorCompletionRequest_slice(f.INTS[fAUTOCOMPLETE_virtualIndex], f.INTS[fAUTOCOMPLETE_virtualIndex] + f.INTS[fAUTOCOMPLETE_virtualCount], filter);
    }
}

function AUTOCOMPLETE_events_onkeydown(event) {
    // Goal is to just have it disappear 99% of the time you interact with it and pull back on a key by key basis in time.
    switch (event.key) {
        case 'Shift':
            // Shift felt especially awkward to hide on because I was trying to 'Shift' + mousewheel so I could horizontally scroll (there's a horizontal scrollbar currently)
            break;
        case 'ArrowDown':
            event.preventDefault();
            event.stopPropagation();
            AUTOCOMPLETE_cursor_do_set(
                AUTOCOMPLETE_cursor_validate(f.INTS[fAUTOCOMPLETE_cursorIndex] + 1));
            break;
        case 'ArrowUp':
            event.preventDefault();
            event.stopPropagation();
            AUTOCOMPLETE_cursor_do_set(
                AUTOCOMPLETE_cursor_validate(f.INTS[fAUTOCOMPLETE_cursorIndex] - 1));
            break;
        default:
            AUTOCOMPLETE_hide();
            if (f.EDI_baseElement) {
                f.EDI_baseElement.focus();
            }
            break;
    }
}
