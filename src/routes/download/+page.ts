import { barcodePropsValid, qrCodePropsValid, studyPropsValid } from '$lib/stores/configStore';
import { base } from '$app/paths';
import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import type { PageLoad } from './$types';

export const load = (async () => {
    if (!(get(studyPropsValid) && get(barcodePropsValid) && get(qrCodePropsValid))) {
        throw redirect(302, `${base}/study-configuration`);
    }
    return {};
}) satisfies PageLoad;
