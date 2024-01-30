pragma circom 2.1.5;

include "circomlib/circuits/poseidon.circom";
include "../utils/ceil.circom";
include "../utils/email_nullifier.circom";
include "../utils/hash_sign_gen_rand.circom";
include "../common/regexes/from_regex.circom";

include "./utils/email_verifier.circom";
include "./utils/extract.circom";

template WiseSendEmail(max_header_bytes, max_body_bytes, n, k, pack_size) {
    assert(n * k > 1024); // constraints for 1024 bit RSA

    // Rounded to the nearest multiple of pack_size for extra room in case of change of constants
    //var max_email_amount_len = 8; // Allowing max 4 fig amount + one decimal point + 2 decimal places. e.g. $2,500.00
    var max_email_from_len = ceil(21, pack_size); // RFC 2821: requires length to be 254, but we can limit to 21 (venmo@venmo.com)
    var max_email_timestamp_len = 10; // 10 digits till year 2286
    // 21 digits does not include the 3 chars `=\r\n` extracted from regex. These 3 chars will be removed during shift and pack
    // Current Venmo IDs are 19 digits, but we allow for 21 digits to be future proof
    var max_payee_len = ceil(21, pack_size);

    signal input in_padded[max_header_bytes]; // prehashed email data, includes up to 512 + 64? bytes of padding pre SHA256, and padded with lots of 0s at end after the length
    signal input modulus[k]; // rsa pubkey, verified with smart contract + DNSSEC proof. split up into k parts of n bits each.
    signal input signature[k]; // rsa signature. split up into k parts of n bits each.
    signal input in_len_padded_bytes; // length of in email data including the padding, which will inform the sha256 block length

    // Base 64 body hash variables
    signal input body_hash_idx;
    // The precomputed_sha value is the Merkle-Damgard state of our SHA hash uptil our first regex match which allows us to save SHA constraints by only hashing the relevant part of the body
    signal input precomputed_sha[32];
    // Suffix of the body after precomputed SHA
    signal input in_body_padded[max_body_bytes];
    // Length of the body after precomputed SHA
    signal input in_body_len_padded_bytes;

    signal output modulus_hash;

    // DKIM VERIFICATION
    component EV = EmailVerifier(max_header_bytes, max_body_bytes, n, k, 0);
    EV.in_padded <== in_padded;
    EV.pubkey <== modulus;
    EV.signature <== signature;
    EV.in_len_padded_bytes <== in_len_padded_bytes;
    EV.body_hash_idx <== body_hash_idx;
    EV.precomputed_sha <== precomputed_sha;
    EV.in_body_padded <== in_body_padded;
    EV.in_body_len_padded_bytes <== in_body_len_padded_bytes;
    signal header_hash[256] <== EV.sha;

    modulus_hash <== EV.pubkey_hash;

    
}

// Args:
// * max_header_bytes = 1024 is the max number of bytes in the header
// * max_body_bytes = 6272 is the max number of bytes in the body after precomputed slice (Need to leave room for >280 char custom message)
// * n = 121 is the number of bits in each chunk of the modulus (RSA parameter)
// * k = 17 is the number of chunks in the modulus (RSA parameter)
// * pack_size = 7 is the number of bytes that can fit into a 255ish bit signal (can increase later)
component main = WiseSendEmail(1024, 8192, 121, 17, 7);