import { describe, it, expect, beforeAll } from 'vitest';
import { loadAppFunctions } from '../helpers/load-source.js';

describe('Move Support Engine', () => {
  let extractTypeFromUrl;
  let choosePreferredResourceType;
  let resolveResourceTypeInfo;
  let lookupResourceType;
  let getStatus;
  let getDocUrlForType;

  beforeAll(() => {
    ({
      extractTypeFromUrl,
      choosePreferredResourceType,
      resolveResourceTypeInfo,
      lookupResourceType,
      getStatus,
      getDocUrlForType
    } = loadAppFunctions());
  });

  describe('extractTypeFromUrl()', () => {
    it('extracts child resource types from Azure portal URLs', () => {
      const type = extractTypeFromUrl(
        'https://portal.azure.com/#resource/subscriptions/x/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm01/extensions/MicrosoftMonitoringAgent'
      );
      expect(type).toBe('Microsoft.Compute/virtualMachines/extensions');
    });

    it('extracts third-party provider namespaces from portal URLs', () => {
      const type = extractTypeFromUrl(
        'https://portal.azure.com/#resource/subscriptions/x/resourceGroups/rg/providers/MongoDB.Atlas/organizations/org01'
      );
      expect(type).toBe('MongoDB.Atlas/organizations');
    });
  });

  describe('resolveResourceTypeInfo()', () => {
    it('prefers the more specific display type when it is deeper than the URL type', () => {
      expect(
        choosePreferredResourceType(
          'Microsoft.Compute/virtualMachines/extensions',
          'Microsoft.Compute/virtualMachines'
        )
      ).toBe('Microsoft.Compute/virtualMachines/extensions');
    });

    it('keeps the child resource type and resolves move info for VM extensions', () => {
      const result = resolveResourceTypeInfo(
        'Microsoft.Compute/virtualMachines/extensions',
        'https://portal.azure.com/#resource/subscriptions/x/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm01/extensions/MicrosoftMonitoringAgent'
      );

      expect(result.finalType).toBe('Microsoft.Compute/virtualMachines/extensions');
      expect(result.info).toBeTruthy();
    });
  });

  describe('lookupResourceType()', () => {
    it('returns null for null/undefined input', () => {
      expect(lookupResourceType(null)).toBeNull();
      expect(lookupResourceType(undefined)).toBeNull();
      expect(lookupResourceType('')).toBeNull();
    });

    it('finds VMs (case-insensitive)', () => {
      expect(lookupResourceType('Microsoft.Compute/virtualMachines')).toBeTruthy();
      expect(lookupResourceType('microsoft.compute/virtualmachines')).toBeTruthy();
      expect(lookupResourceType('MICROSOFT.COMPUTE/VIRTUALMACHINES')).toBeTruthy();
    });

    it('strips leading slashes', () => {
      const result = lookupResourceType('/Microsoft.Storage/storageAccounts');
      expect(result).toBeTruthy();
    });

    it('returns null for unknown types', () => {
      expect(lookupResourceType('Microsoft.Fictional/nonexistent')).toBeNull();
    });

    it('falls back to parent namespace for child resources', () => {
      // microsoft.web/sites/slots → falls back to microsoft.web/sites if no exact match
      const exact = lookupResourceType('microsoft.web/sites/slots');
      expect(exact).toBeTruthy();
    });
  });

  describe('getStatus()', () => {
    it('returns "unknown" for null info', () => {
      expect(getStatus(null)).toBe('unknown');
    });

    it('returns "movable" when both RG and Sub are 1', () => {
      expect(getStatus({ moveRG: 1, moveSub: 1, moveRegion: 0 })).toBe('movable');
      expect(getStatus({ moveRG: 1, moveSub: 1, moveRegion: 1 })).toBe('movable');
    });

    it('returns "partial" when only one is supported', () => {
      expect(getStatus({ moveRG: 1, moveSub: 0, moveRegion: 0 })).toBe('partial');
      expect(getStatus({ moveRG: 0, moveSub: 1, moveRegion: 0 })).toBe('partial');
      expect(getStatus({ moveRG: 0, moveSub: 0, moveRegion: 1 })).toBe('partial');
    });

    it('returns "not-movable" when nothing is supported', () => {
      expect(getStatus({ moveRG: 0, moveSub: 0, moveRegion: 0 })).toBe('not-movable');
    });
  });

  describe('getDocUrlForType()', () => {
    it('returns empty string for null input', () => {
      expect(getDocUrlForType(null)).toBe('');
      expect(getDocUrlForType('')).toBe('');
    });

    it('builds learn.microsoft.com URL with provider anchor', () => {
      const url = getDocUrlForType('Microsoft.Compute/virtualMachines');
      expect(url).toContain('learn.microsoft.com');
      expect(url).toContain('move-support-resources');
      expect(url).toContain('#microsoftcompute');
    });

    it('returns empty string for non-Microsoft providers', () => {
      expect(getDocUrlForType('Custom.Provider/foo')).toBe('');
    });

    it('always uses HTTPS', () => {
      const url = getDocUrlForType('Microsoft.Storage/storageAccounts');
      expect(url).toMatch(/^https:\/\//);
    });
  });

  describe('End-to-end resource analysis', () => {
    it('analyzes a typical VM correctly', () => {
      const info = lookupResourceType('Microsoft.Compute/virtualMachines');
      const status = getStatus(info);
      expect(['movable', 'partial']).toContain(status);
    });

    it('analyzes Storage Account correctly', () => {
      const info = lookupResourceType('Microsoft.Storage/storageAccounts');
      expect(info).toBeTruthy();
      const status = getStatus(info);
      expect(['movable', 'partial']).toContain(status);
    });
  });
});
