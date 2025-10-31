import { supabase } from './supabaseClient';

export enum AccountType {
  FREE = 'free',
  PREMIUM = 'premium'
}

export enum ModelTier {
  FREE = 'free',
  PREMIUM = 'premium'
}

export interface User {
  id: string;
  email: string;
  accountType: AccountType;
}

export interface AccessValidation {
  success: boolean;
  error?: string;
  code?: string;
  message?: string;
  userTier?: AccountType;
}

export class ModelAccessController {
  private freeModels: Set<string>;
  private premiumModels: Set<string>;

  constructor() {
    this.freeModels = new Set([
      'gpt-3.5-turbo',
      'claude-3-haiku',
      'gemini-2.5-flash-lite',
      'llama-4-scout',
      'grok-4-fast',
      'deepseek-v3',
      'qwen-3',
      'mistral-small',
      'cohere-command-r',
      'ernie-4.5',
      'nemotron-nano-9b-v2',
      'owenx3-vl-32b-thinking',
      'qwen-vl-plus',
      'llama-4.3-vision'
    ]);

    this.premiumModels = new Set([
      'gpt-5-chat',
      'claude-opus-4',
      'claude-opus-4.1',
      'claude-sonnet-4.5',
      'claude-haiku-4.5',
      'deepseek-v3.2',
      'gemini-2.5-flash-image',
      'perplexity-sonar-pro',
      'perplexity-reasoning-pro',
      'nemotron-super-49b',
      'llama-4-maverick',
      'glm-4.6',
      'kimi-k2-0905',
      'sora-2',
      'veo-3-fast'
    ]);
  }

  async getUserAccountType(userId: string): Promise<AccountType> {
    try {
      console.log('🔍 [ACCESS CONTROLLER] Checking account type for:', userId);

      const { data: paidUser, error: paidError } = await supabase
        .from('paid_tier_users')
        .select('id, tier_level')
        .eq('id', userId)
        .maybeSingle();

      if (paidError) {
        console.error('❌ [ACCESS CONTROLLER] Error checking paid_tier_users:', paidError);
      }

      if (paidUser && paidUser.tier_level === 'premium') {
        console.log('✅ [ACCESS CONTROLLER] User is PREMIUM');
        return AccountType.PREMIUM;
      }

      console.log('ℹ️ [ACCESS CONTROLLER] User is FREE');
      return AccountType.FREE;
    } catch (error) {
      console.error('❌ [ACCESS CONTROLLER] Exception:', error);
      return AccountType.FREE;
    }
  }

  isModelFree(modelId: string): boolean {
    return this.freeModels.has(modelId);
  }

  isModelPremium(modelId: string): boolean {
    return this.premiumModels.has(modelId);
  }

  async hasAccessToModel(userId: string, modelId: string): Promise<boolean> {
    const accountType = await this.getUserAccountType(userId);

    if (this.isModelFree(modelId)) {
      return true;
    }

    if (this.isModelPremium(modelId)) {
      return accountType === AccountType.PREMIUM;
    }

    return false;
  }

  async validateModelAccess(userId: string, modelId: string): Promise<AccessValidation> {
    if (!userId) {
      return {
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      };
    }

    const accountType = await this.getUserAccountType(userId);
    const hasAccess = await this.hasAccessToModel(userId, modelId);

    if (!hasAccess) {
      if (this.isModelPremium(modelId) && accountType === AccountType.FREE) {
        return {
          success: false,
          error: `Model "${modelId}" requires premium subscription`,
          code: 'PREMIUM_REQUIRED'
        };
      }

      return {
        success: false,
        error: `Model "${modelId}" not found or access denied`,
        code: 'ACCESS_DENIED'
      };
    }

    return {
      success: true,
      message: 'Access granted',
      userTier: accountType
    };
  }

  async getAvailableModels(userId: string): Promise<{
    tier: AccountType;
    freeModels: string[];
    premiumModels: string[];
    allModels: string[];
  }> {
    const accountType = await this.getUserAccountType(userId);
    const freeModelsList = Array.from(this.freeModels);
    const premiumModelsList = Array.from(this.premiumModels);

    if (accountType === AccountType.PREMIUM) {
      return {
        tier: AccountType.PREMIUM,
        freeModels: freeModelsList,
        premiumModels: premiumModelsList,
        allModels: [...freeModelsList, ...premiumModelsList]
      };
    }

    return {
      tier: AccountType.FREE,
      freeModels: freeModelsList,
      premiumModels: [],
      allModels: freeModelsList
    };
  }
}

export const modelAccessController = new ModelAccessController();
