import {describe, expect, test} from '@jest/globals';
import {attributeCode} from "@/prisma/attribute-codes";

describe('attributeCode', () => {
    test("donne aux attributs des règles du configurateur le code qu'elles attendent", () => {
        expect(attributeCode('Socket', 'processeurs')).toBe('socket');
        expect(attributeCode('Socket', 'cartes-meres')).toBe('socket');
        expect(attributeCode('Type DDR', 'memoire-ram')).toBe('ddr_type');
        expect(attributeCode('Format', 'cartes-meres')).toBe('form_factor');
        expect(attributeCode('TDP (W)', 'processeurs')).toBe('tdp');
        expect(attributeCode('Puissance (W)', 'alimentations')).toBe('psu_power');
        expect(attributeCode('Slots mémoire', 'cartes-meres')).toBe('memory_slots');
        expect(attributeCode('Graphiques intégrés', 'processeurs')).toBe('integrated_graphics');
    });

    test("dérive les autres codes du libellé, sans accent ni ponctuation", () => {
        expect(attributeCode('Nombre de cœurs', 'processeurs')).toBe('nombre_de_coeurs');
        expect(attributeCode('Écriture séquentielle (MB/s)', 'ssd')).toBe('ecriture_sequentielle_mb_s');
        expect(attributeCode('Cache L3 (MB)', 'processeurs')).toBe('cache_l3_mb');
    });

    test("distingue par leur catégorie les attributs distincts qui portent le même libellé", () => {
        expect(attributeCode('Format', 'alimentations')).toBe('psu_form_factor');
        expect(attributeCode('Interface', 'ssd')).toBe('interface_ssd');
        expect(attributeCode('Interface', 'disques-durs')).toBe('interface_disques_durs');
        expect(attributeCode('Capacité (GB)', 'memoire-ram')).toBe('capacite_gb_memoire_ram');
        expect(attributeCode('RGB', 'peripheriques')).toBe('rgb_peripheriques');
    });
});
