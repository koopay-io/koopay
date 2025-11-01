import {
  Horizon,
  Keypair,
  Networks,
  TransactionBuilder,
  Operation,
  Asset,
} from "@stellar/stellar-sdk";
import CryptoJS from "crypto-js";

export interface StellarWallet {
  publicKey: string;
  secretKey?: string;
  authMethod: string;
  createdAt: number;
}

export interface WalletBalance {
  asset: string;
  balance: string;
}

export class StellarWalletManager {
  private server: Horizon.Server;
  private network: string;

  constructor(network: "testnet" | "mainnet" = "testnet") {
    this.network = network;
    this.server = new Horizon.Server(
      network === "testnet"
        ? "https://horizon-testnet.stellar.org"
        : "https://horizon.stellar.org"
    );
  }

  /**
   * Create a deterministic wallet from Google user data
   */
  createWalletFromGoogle(userId: string, email: string): StellarWallet {
    // Create deterministic keypair from Google user ID
    const seed = CryptoJS.SHA256(`google:${userId}:${email}`).toString();
    const keypair = Keypair.fromSecret(seed);

    return {
      publicKey: keypair.publicKey(),
      secretKey: keypair.secret(),
      authMethod: "google",
      createdAt: Date.now(),
    };
  }

  /**
   * Create a deterministic wallet from any identifier
   */
  createWalletFromIdentifier(
    identifier: string,
    authMethod: string
  ): StellarWallet {
    // Create a deterministic seed from the identifier
    const seedData = `${authMethod}:${identifier}`;
    const hash = CryptoJS.SHA256(seedData).toString();

    // Convert hash to 32-byte buffer for Ed25519 seed
    // Pad or truncate to exactly 32 bytes
    const hashBuffer = Buffer.from(hash, "hex");
    const seedBuffer = Buffer.alloc(32);

    if (hashBuffer.length >= 32) {
      hashBuffer.copy(seedBuffer, 0, 0, 32);
    } else {
      hashBuffer.copy(seedBuffer, 0);
      // Fill remaining bytes with repeated hash
      let offset = hashBuffer.length;
      while (offset < 32) {
        const remaining = Math.min(hashBuffer.length, 32 - offset);
        hashBuffer.copy(seedBuffer, offset, 0, remaining);
        offset += remaining;
      }
    }

    const keypair = Keypair.fromRawEd25519Seed(seedBuffer);

    return {
      publicKey: keypair.publicKey(),
      secretKey: keypair.secret(),
      authMethod,
      createdAt: Date.now(),
    };
  }

  /**
   * Fund a testnet account using friendbot
   */
  async fundTestnetAccount(publicKey: string): Promise<boolean> {
    if (this.network !== "testnet") return false;

    try {
      const response = await fetch(
        `https://friendbot.stellar.org?addr=${publicKey}`
      );
      if (!response.ok) {
        throw new Error("Friendbot funding failed");
      }
      console.log("✅ Account funded with testnet XLM");
      return true;
    } catch (error: unknown) {
      console.warn(
        "⚠️ Friendbot funding failed:",
        error instanceof Error ? error.message : "Unknown error"
      );
      return false;
    }
  }

  /**
   * Check if account exists on Stellar network
   */
  async accountExists(publicKey: string): Promise<boolean> {
    try {
      await this.server.loadAccount(publicKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get account balance
   */
  async getBalance(publicKey: string): Promise<WalletBalance[]> {
    try {
      const account = await this.server.loadAccount(publicKey);
      return account.balances.map((balance) => ({
        asset:
          balance.asset_type === "native"
            ? "XLM"
            : (balance as { asset_code?: string }).asset_code || "Unknown",
        balance: balance.balance,
      }));
    } catch (error) {
      console.error("Error fetching balance:", error);
      return [];
    }
  }

  /**
   * Create and fund a new wallet
   */
  async createAndFundWallet(
    identifier: string,
    authMethod: string
  ): Promise<StellarWallet> {
    const wallet = this.createWalletFromIdentifier(identifier, authMethod);

    // Check if account already exists
    const exists = await this.accountExists(wallet.publicKey);

    if (!exists && this.network === "testnet") {
      // Fund the account
      await this.fundTestnetAccount(wallet.publicKey);

      // Wait a bit for the account to be created
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    return wallet;
  }

  /**
   * Establish a trustline to a custom asset
   */
  async establishTrustline(
    secretKey: string,
    assetCode: string,
    assetIssuer: string
  ): Promise<boolean> {
    try {
      const keypair = Keypair.fromSecret(secretKey);
      const account = await this.server.loadAccount(keypair.publicKey());

      const asset = new Asset(assetCode, assetIssuer);

      const transaction = new TransactionBuilder(account, {
        fee: "100",
        networkPassphrase:
          this.network === "testnet" ? Networks.TESTNET : Networks.PUBLIC,
      })
        .addOperation(
          Operation.changeTrust({
            asset: asset,
            limit: "100000000", // Large limit
          })
        )
        .setTimeout(30)
        .build();

      transaction.sign(keypair);

      await this.server.submitTransaction(transaction);
      console.log(`✅ Trustline established for ${assetCode}`);
      return true;
    } catch (error) {
      console.error("Trustline establishment failed:", error);
      return false;
    }
  }

  /**
   * Swap XLM for USDC using path payment (testnet)
   * This converts native XLM to USDC through Stellar's DEX
   */
  async swapXLMtoUSDC(
    secretKey: string,
    xlmAmount: string,
    usdcIssuer: string
  ): Promise<boolean> {
    try {
      const keypair = Keypair.fromSecret(secretKey);
      const account = await this.server.loadAccount(keypair.publicKey());

      const usdcAsset = new Asset("USDC", usdcIssuer);

      // Use path payment strict send to convert XLM to USDC
      const transaction = new TransactionBuilder(account, {
        fee: "100000", // Higher fee for path payment
        networkPassphrase:
          this.network === "testnet" ? Networks.TESTNET : Networks.PUBLIC,
      })
        .addOperation(
          Operation.pathPaymentStrictSend({
            sendAsset: Asset.native(),
            sendAmount: xlmAmount,
            destination: keypair.publicKey(), // Send to self
            destAsset: usdcAsset,
            destMin: "0.1", // Minimum amount to receive (allows for slippage)
          })
        )
        .setTimeout(30)
        .build();

      transaction.sign(keypair);

      await this.server.submitTransaction(transaction);
      console.log(`✅ Swapped ${xlmAmount} XLM for USDC`);
      return true;
    } catch (error) {
      console.error("XLM to USDC swap failed:", error);
      console.error("⚠️ This might fail if there's no liquidity in the testnet DEX");
      return false;
    }
  }

  /**
   * Send payment (simplified version)
   */
  async sendPayment(
    secretKey: string,
    destination: string,
    amount: string,
    asset: string = "XLM"
  ): Promise<string | null> {
    try {
      const keypair = Keypair.fromSecret(secretKey);
      const account = await this.server.loadAccount(keypair.publicKey());

      const transaction = new TransactionBuilder(account, {
        fee: "100",
        networkPassphrase:
          this.network === "testnet" ? Networks.TESTNET : Networks.PUBLIC,
      })
        .addOperation(
          Operation.payment({
            destination,
            asset:
              asset === "XLM" ? Asset.native() : new Asset(asset, "ISSUER"),
            amount,
          })
        )
        .setTimeout(30)
        .build();

      transaction.sign(keypair);

      const result = await this.server.submitTransaction(transaction);
      return result.hash;
    } catch (error) {
      console.error("Payment failed:", error);
      return null;
    }
  }
}
