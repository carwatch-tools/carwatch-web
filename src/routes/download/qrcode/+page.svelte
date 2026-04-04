<script lang="ts">
  import { PAPER_FORMATS, PAPER_FORMAT_A4, PAPER_FORMAT_LETTER } from "$lib/constants";
  import { qrCodeProps, studyProps } from "$lib/stores/configStore";
  import { qrDataArray } from "$lib/stores/dataStore";
	import { onMount } from "svelte";
  import QRCode from 'qrcode';
	import PrintInstruction from "$lib/components/download/PrintInstruction.svelte";
	import BackButton from "$lib/components/general/BackButton.svelte";

    const qrLabelLayout = {
        pagePaddingMm: 20,
        rowGapMm: 10,
        columnGapMm: 6,
        maxQrSizeMm: 42,
        minQrSizeMm: 28,
        topTextGapMm: 0,
        bottomTextGapMm: 1.5,
        labelInlinePaddingMm: 2,
        labelPaddingTopMm: 0,
        labelPaddingBottomMm: 4,
        fontSizePt: 12,
        lineHeight: 1.15
    };

    const ptToMm = 0.352778;

    onMount(async() => {
        Array.from(document.getElementsByClassName("qr-code")).forEach((canvas, i) => {
            if (canvas instanceof HTMLCanvasElement && i < $studyProps.numParticipants){
                QRCode.toCanvas(canvas, $qrDataArray[i], {scale:3}, function(error:any){
                    if (error) console.error(error);
                })
            }
        });
      });

    const paperFormat = $qrCodeProps.useLetterFormat ? PAPER_FORMATS[PAPER_FORMAT_LETTER] : PAPER_FORMATS[PAPER_FORMAT_A4];
    let width = `${paperFormat.widthMm}mm`;
    let height = `${paperFormat.heightMm}mm`;
    let qrPerPage: number = $qrCodeProps.numColumns * $qrCodeProps.numRows;
    let numPages: number = Math.ceil($studyProps.numParticipants/qrPerPage);
    const textHeightMm = qrLabelLayout.fontSizePt * ptToMm * qrLabelLayout.lineHeight;
    const cellWidthMm = (paperFormat.widthMm - 2 * qrLabelLayout.pagePaddingMm - ($qrCodeProps.numColumns - 1) * qrLabelLayout.columnGapMm) / $qrCodeProps.numColumns;
    const cellHeightMm = (paperFormat.heightMm - 2 * qrLabelLayout.pagePaddingMm - ($qrCodeProps.numRows - 1) * qrLabelLayout.rowGapMm) / $qrCodeProps.numRows;
    const reservedTopMm = $qrCodeProps.includeStudyName ? textHeightMm + qrLabelLayout.topTextGapMm : 0;
    const reservedBottomMm = $qrCodeProps.includeParticipantId ? textHeightMm + qrLabelLayout.bottomTextGapMm : 0;
    const qrSizeMm = Math.max(
        qrLabelLayout.minQrSizeMm,
        Math.min(
            qrLabelLayout.maxQrSizeMm,
            cellWidthMm - 2 * qrLabelLayout.labelInlinePaddingMm,
            cellHeightMm - qrLabelLayout.labelPaddingTopMm - qrLabelLayout.labelPaddingBottomMm - reservedTopMm - reservedBottomMm
        )
    );
</script>

<div class="h-full">
    <BackButton parentRoute="download" />
    <PrintInstruction fileType={"QR codes"} widthMm={paperFormat.widthMm}/>

    {#each Array(numPages) as _, page}
        <div
            class="page grid grid-cols-{$qrCodeProps.numColumns} bg-white px"
            style="--width: {width}; --height: {height}; --label-width: {cellWidthMm}mm; --label-height: {cellHeightMm}mm; --qr-size: {qrSizeMm}mm; --label-inline-padding: {qrLabelLayout.labelInlinePaddingMm}mm; --label-padding-top: {qrLabelLayout.labelPaddingTopMm}mm; --label-padding-bottom: {qrLabelLayout.labelPaddingBottomMm}mm; --top-text-gap: {qrLabelLayout.topTextGapMm}mm; --bottom-text-gap: {qrLabelLayout.bottomTextGapMm}mm; --label-font-size: {qrLabelLayout.fontSizePt}pt;"
            style:padding="{qrLabelLayout.pagePaddingMm}mm"
            style:row-gap="{qrLabelLayout.rowGapMm}mm"
            style:column-gap="{qrLabelLayout.columnGapMm}mm"
        >
            {#each Array(qrPerPage) as _, i}
                <div class="label overflow-hidden" >
                    {#if $qrCodeProps.includeStudyName && page * qrPerPage + i < $studyProps.numParticipants}
                        <p class="top-label text-black">{$studyProps.studyName}</p>
                    {/if}
                    <canvas class="qr-code object-contain justify-center" />
                    {#if $qrCodeProps.includeParticipantId && page * qrPerPage + i < $studyProps.numParticipants}
                        <p class="bottom-label text-black">{$studyProps.participantList[page * qrPerPage + i]}</p>
                    {/if}
                </div>
            {/each}
        </div>
    {/each}
</div>

<style>
    * {
        box-sizing: border-box;
        -moz-box-sizing: border-box;
        -webkit-box-sizing: border-box;
    }

    .label {
        width: var(--label-width);
        min-height: var(--label-height);
        display: grid;
        justify-items: center;
        align-content: start;
        padding-top: var(--label-padding-top);
        padding-bottom: var(--label-padding-bottom);
        padding-left: var(--label-inline-padding);
        padding-right: var(--label-inline-padding);
        box-sizing: border-box;
    }

    .qr-code {
        width: var(--qr-size);
        height: var(--qr-size);
        max-width: var(--qr-size);
        max-height: var(--qr-size);
    }

    .top-label,
    .bottom-label {
        text-align: center;
        width: 100%;
        line-height: 1.1;
        font-size: var(--label-font-size);
        margin: 0;
    }

    .top-label {
        margin-bottom: var(--top-text-gap);
    }

    .bottom-label {
        margin-top: var(--bottom-text-gap);
    }

    .page {
        /*A4 format*/
        width: var(--width);
        height: var(--height);
        /*distance between pages*/
        margin-left: 10mm;
        margin-top: 10mm;
        margin-bottom: 10mm;
        background: white;
        outline: 3px #000000 solid;
    }

    @page {
        size: auto;
        margin: 0;
    }
   
    @media print {
        * {
            overflow: visible !important;
        }
        .label {
            outline: none;
        }
        .page {
            margin: 0;
            border: initial;
            border-radius: initial;
            min-height: initial;
            box-shadow: initial;
            background: initial;
            outline: none;
        }
    }
</style>
