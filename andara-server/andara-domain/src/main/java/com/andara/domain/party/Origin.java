package com.andara.domain.party;

import com.andara.common.ValueObject;

/**
 * Value object representing character origin/background.
 * Origins provide starting bonuses and penalties.
 */
public enum Origin implements ValueObject {
    VAULT_DWELLER("Vault Dweller", "Sheltered from the Convergence in underground vaults"),
    WASTELANDER("Wastelander", "Survived the wastes through skill and determination"),
    RIFT_TOUCHED("Rift-Touched", "Altered by dimensional energy, sensitive to rifts");

    private final String displayName;
    private final String description;

    Origin(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}

