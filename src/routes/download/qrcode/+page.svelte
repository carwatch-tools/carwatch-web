<script lang="ts">
  import { PAPER_FORMATS, PAPER_FORMAT_A4, PAPER_FORMAT_LETTER } from "$lib/constants";
  import { qrCodeProps, studyProps } from "$lib/stores/configStore";
  import { qrDataArray } from "$lib/stores/dataStore";
	import { onMount } from "svelte";
  import QRCode from 'qrcode';
	import PrintInstruction from "$lib/components/download/PrintInstruction.svelte";
	import BackButton from "$lib/components/general/BackButton.svelte";

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
</script>

<div class="h-full">
    <BackButton parentRoute="download" />
    <PrintInstruction fileType={"QR codes"} widthMm={paperFormat.widthMm}/>

    {#each Array(numPages) as _, page}
        <div
            class="page grid grid-cols-{$qrCodeProps.numColumns} bg-white px"
            style="--width: {width}; --height: {height}; --page-padding: 20mm; --row-gap: 8mm; --column-gap: 4mm; --qr-size: 38mm; --label-offset: 1mm; --label-inline-padding: 2mm;"
            style:padding="var(--page-padding)"
            style:row-gap="var(--row-gap)"
            style:column-gap="var(--column-gap)"
        >
            {#each Array(qrPerPage) as _, i}
                <div class="label overflow-hidden" >
                    {#if $qrCodeProps.includeStudyName && page * qrPerPage + i < $studyProps.numParticipants}
                        <p class="absolute top-label text-black">{$studyProps.studyName}</p>
                    {/if}
                    <canvas class="qr-code object-contain justify-center" />
                    {#if $qrCodeProps.includeParticipantId && page * qrPerPage + i < $studyProps.numParticipants}
                        <p class="absolute bottom-label text-black">{$studyProps.participantList[page * qrPerPage + i]}</p>
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
        position: relative;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: calc(var(--qr-size) + 2 * var(--label-offset) + 10mm);
        padding-top: 6mm;
        padding-bottom: 6mm;
    }

    .qr-code {
        width: var(--qr-size);
        height: var(--qr-size);
        max-width: var(--qr-size);
        max-height: var(--qr-size);
    }

    .top-label,
    .bottom-label {
        left: 50%;
        transform: translateX(-50%);
        text-align: center;
        width: calc(100% - 2 * var(--label-inline-padding));
        line-height: 1.1;
        font-size: 4.5mm;
    }

    .top-label {
        top: var(--label-offset);
    }

    .bottom-label {
        bottom: var(--label-offset);
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
