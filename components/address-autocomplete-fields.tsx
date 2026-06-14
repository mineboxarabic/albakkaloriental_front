"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Search } from "lucide-react";
import { COLORS } from "@/lib/ui";

type BanFeature = {
  geometry: { coordinates: [number, number] };
  properties: {
    label: string;
    name?: string;
    housenumber?: string;
    street?: string;
    postcode: string;
    city: string;
  };
};

type Suggestion = {
  addressLine: string;
  postalCode: string;
  city: string;
  label: string;
};

const BAN_URL = "https://api-adresse.data.gouv.fr/search";
const DEBOUNCE_MS = 250;
const MIN_LEN = 3;

function featureToSuggestion(f: BanFeature): Suggestion {
  const addressLine =
    f.properties.name ??
    [f.properties.housenumber, f.properties.street].filter(Boolean).join(" ") ??
    "";
  return {
    addressLine,
    postalCode: f.properties.postcode,
    city: f.properties.city,
    label: f.properties.label,
  };
}

function Field({
  name,
  label,
  value,
  onChange,
  error,
  placeholder,
  readOnly,
  autoComplete,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  readOnly?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-semibold" style={{ color: COLORS.text }}>
        {label}
      </span>
      <input
        name={name}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        autoComplete={autoComplete}
        required
        className="h-11 rounded-md border px-3 text-[13.5px] outline-none focus:border-[#3F561F]"
        style={{
          borderColor: error ? COLORS.red : COLORS.border,
          background: readOnly ? "#FAF8F2" : "#FFFFFF",
          color: COLORS.text,
        }}
      />
      {error && (
        <span className="text-[11.5px]" style={{ color: COLORS.red }}>
          {error}
        </span>
      )}
    </label>
  );
}

export function AddressAutocompleteFields({
  defaults,
  errors,
  onChange,
}: {
  defaults: { address: string; postalCode: string; city: string };
  errors: { address?: string; postalCode?: string; city?: string };
  onChange?: (value: { address: string; postalCode: string; city: string }) => void;
}) {
  const [address, setAddressRaw] = useState(defaults.address);
  const [postalCode, setPostalCodeRaw] = useState(defaults.postalCode);
  const [city, setCityRaw] = useState(defaults.city);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const setAddress = (v: string) => {
    setAddressRaw(v);
    onChange?.({ address: v, postalCode, city });
  };
  const setPostalCode = (v: string) => {
    setPostalCodeRaw(v);
    onChange?.({ address, postalCode: v, city });
  };
  const setCity = (v: string) => {
    setCityRaw(v);
    onChange?.({ address, postalCode, city: v });
  };
  const setAddressBundle = (next: { address: string; postalCode: string; city: string }) => {
    setAddressRaw(next.address);
    setPostalCodeRaw(next.postalCode);
    setCityRaw(next.city);
    onChange?.(next);
  };

  useEffect(() => {
    if (address.trim().length < MIN_LEN) {
      setSuggestions([]);
      return;
    }
    const handle = setTimeout(async () => {
      setLoading(true);
      try {
        const url = new URL(BAN_URL);
        url.searchParams.set("q", address);
        url.searchParams.set("limit", "6");
        url.searchParams.set("autocomplete", "1");
        const response = await fetch(url.toString());
        if (!response.ok) return;
        const data = (await response.json()) as { features: BanFeature[] };
        setSuggestions(data.features.map(featureToSuggestion));
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [address]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <>
      <div ref={wrapperRef} className="relative">
        <label className="flex flex-col gap-1.5">
          <span className="text-[12.5px] font-semibold" style={{ color: COLORS.text }}>
            Adresse
          </span>
          <div className="relative">
            <Search
              className="absolute left-3 top-3.5 h-4 w-4"
              style={{ color: COLORS.muted }}
              strokeWidth={2}
            />
            <input
              name="address"
              type="text"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder="13 Rue de la République"
              autoComplete="street-address"
              required
              className="h-11 w-full rounded-md border pl-9 pr-9 text-[13.5px] outline-none focus:border-[#3F561F]"
              style={{
                borderColor: errors.address ? COLORS.red : COLORS.border,
                background: "#FFFFFF",
                color: COLORS.text,
              }}
            />
            {loading && (
              <Loader2
                className="absolute right-3 top-3.5 h-4 w-4 animate-spin"
                style={{ color: COLORS.muted }}
              />
            )}
          </div>
          {errors.address && (
            <span className="text-[11.5px]" style={{ color: COLORS.red }}>
              {errors.address}
            </span>
          )}
        </label>
        {open && suggestions.length > 0 && (
          <div
            className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-md border bg-white shadow-lg"
            style={{ borderColor: COLORS.border }}
          >
            {suggestions.map((s, idx) => (
              <button
                type="button"
                key={`${s.label}-${idx}`}
                onClick={() => {
                  setAddressBundle({
                    address: s.addressLine || s.label,
                    postalCode: s.postalCode,
                    city: s.city,
                  });
                  setOpen(false);
                }}
                className="flex w-full items-start gap-2 px-3 py-3 text-left text-[13px] hover:bg-[#FAF8F2]"
              >
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0"
                  style={{ color: COLORS.muted }}
                />
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium" style={{ color: COLORS.text }}>
                    {s.label}
                  </div>
                  <div className="text-[11px]" style={{ color: COLORS.muted }}>
                    {s.postalCode} {s.city}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-[140px_1fr] gap-3">
        <Field
          name="postalCode"
          label="Code postal"
          value={postalCode}
          onChange={setPostalCode}
          error={errors.postalCode}
          placeholder="83300"
          autoComplete="postal-code"
        />
        <Field
          name="city"
          label="Ville"
          value={city}
          onChange={setCity}
          error={errors.city}
          placeholder="Draguignan"
          autoComplete="address-level2"
        />
      </div>
    </>
  );
}
