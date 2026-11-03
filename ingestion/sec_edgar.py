import xml.etree.ElementTree as ET
from datetime import datetime

import requests

from config import SEC_USER_AGENT


class SECForm4Parser:
    """Parse non-derivative P/S transactions from SEC Form 4 XML."""

    def __init__(self, user_agent=SEC_USER_AGENT):
        self.headers = {"User-Agent": user_agent}

    @staticmethod
    def _text(parent, paths, default=""):
        for path in paths:
            value = parent.findtext(path)
            if value is not None and value.strip():
                return value.strip()
        return default

    def parse_xml_content(self, xml_content: str) -> list[dict]:
        try:
            root = ET.fromstring(xml_content)
        except ET.ParseError:
            return []

        issuer_symbol = self._text(root, [".//issuerTradingSymbol"]).upper()
        issuer_cik = self._text(root, [".//issuerCik"]).zfill(10)
        owner = root.find(".//reportingOwner")
        owner_name = self._text(
            owner if owner is not None else root,
            ["./reportingOwnerId/rptOwnerName", ".//rptOwnerName", ".//reportingOwnerName"],
            "Unknown Owner",
        )
        relationship = owner.find("./reportingOwnerRelationship") if owner is not None else root
        title = self._text(relationship, ["./officerTitle"], "Officer / Director")
        is_director = self._text(relationship, ["./isDirector"], "0") in ("1", "true", "TRUE")
        is_officer = self._text(relationship, ["./isOfficer"], "0") in ("1", "true", "TRUE")

        records = []
        for tx in root.findall(".//nonDerivativeTransaction"):
            code = self._text(tx, ["./transactionCoding/transactionCode"])
            if code not in ("P", "S"):
                continue
            date_text = self._text(tx, ["./transactionDate/value"])
            shares_text = self._text(tx, ["./transactionAmounts/transactionShares/value"], "0")
            price_text = self._text(tx, ["./transactionAmounts/transactionPricePerShare/value"], "0")
            try:
                transaction_date = datetime.strptime(date_text, "%Y-%m-%d").date()
                shares = float(shares_text)
                price = float(price_text)
            except (ValueError, TypeError):
                continue
            if shares <= 0 or price < 0:
                continue
            records.append({
                "cik": issuer_cik,
                "ticker": issuer_symbol,
                "insider_name": owner_name,
                "insider_title": "Board Director" if is_director and not is_officer else title,
                "is_board_director": is_director,
                "is_officer": is_officer,
                "transaction_date": transaction_date,
                "transaction_code": code,
                "shares_traded": shares,
                "price_per_share": price,
                "total_transaction_value": shares * price,
            })
        return records


SAMPLE_FORM4_XML = """<?xml version="1.0"?>
<ownershipDocument>
  <issuer><issuerCik>0000320193</issuerCik><issuerTradingSymbol>AAPL</issuerTradingSymbol></issuer>
  <reportingOwner><reportingOwnerId><rptOwnerName>COOK TIMOTHY D</rptOwnerName></reportingOwnerId>
    <reportingOwnerRelationship><isDirector>1</isDirector><isOfficer>1</isOfficer><officerTitle>Chief Executive Officer</officerTitle></reportingOwnerRelationship>
  </reportingOwner>
  <nonDerivativeTable><nonDerivativeTransaction>
    <transactionDate><value>2024-05-15</value></transactionDate>
    <transactionCoding><transactionCode>P</transactionCode></transactionCoding>
    <transactionAmounts><transactionShares><value>50000</value></transactionShares><transactionPricePerShare><value>185.50</value></transactionPricePerShare></transactionAmounts>
  </nonDerivativeTransaction></nonDerivativeTable>
</ownershipDocument>
"""
