from datetime import date, timedelta
import random
from sqlalchemy import text
from db.connection import engine

COMPANIES = [
    ("0000320193","AAPL","Apple Inc","Technology","Consumer Electronics"),
    ("0000789019","MSFT","Microsoft Corporation","Technology","Software"),
    ("0001045810","NVDA","NVIDIA Corporation","Technology","Semiconductors"),
    ("0001018724","AMZN","Amazon.com Inc","Consumer Cyclical","Internet Retail"),
    ("0001652044","GOOGL","Alphabet Inc","Communication Services","Internet Content"),
    ("0001326801","META","Meta Platforms Inc","Communication Services","Internet Content"),
    ("0001318605","TSLA","Tesla Inc","Consumer Cyclical","Auto Manufacturers"),
    ("0000019617","JPM","JPMorgan Chase & Co","Financial Services","Banks"),
]

def seed_sample_data():
    """Populate the four-table prototype with clearly synthetic demo records."""
    rng = random.Random(42)
    with engine.begin() as conn:
        conn.execute(text("DELETE FROM insider_transactions"))
        conn.execute(text("DELETE FROM sec_filings"))
        conn.execute(text("DELETE FROM daily_prices"))
        conn.execute(text("DELETE FROM companies"))
        for cik,ticker,name,sector,industry in COMPANIES:
            conn.execute(text("""INSERT INTO companies(cik,ticker,company_name,sector,industry)
                                 VALUES(:cik,:ticker,:name,:sector,:industry)"""),
                         {"cik":cik,"ticker":ticker,"name":name,"sector":sector,"industry":industry})
        for cik,ticker,name,sector,industry in COMPANIES:
            for n in range(3):
                accession=f"{cik}-{2024}{n+1:02d}-000001"
                filing_date=date(2024, n+1, 20)
                xml=f"<ownershipDocument><issuer><issuerCik>{cik}</issuerCik><issuerTradingSymbol>{ticker}</issuerTradingSymbol></issuer><reportingOwner><reportingOwnerId><rptOwnerName>Demo Insider {n+1}</rptOwnerName></reportingOwnerId><reportingOwnerRelationship><isOfficer>1</isOfficer><officerTitle>Chief Financial Officer</officerTitle></reportingOwnerRelationship></reportingOwner></ownershipDocument>"
                conn.execute(text("""INSERT INTO sec_filings(accession_number,cik,ticker,filing_date,raw_document_xml)
                                     VALUES(:acc,:cik,:ticker,:date,:xml)"""),
                             {"acc":accession,"cik":cik,"ticker":ticker,"date":filing_date,"xml":xml})
                conn.execute(text("""INSERT INTO insider_transactions(accession_number,cik,ticker,insider_name,insider_title,is_board_director,is_officer,transaction_date,transaction_code,shares_traded,price_per_share,total_transaction_value)
                                     VALUES(:acc,:cik,:ticker,:owner,'Chief Financial Officer',0,1,:txdate,'P',:shares,:price,:value)"""),
                             {"acc":accession,"cik":cik,"ticker":ticker,"owner":f"Demo Insider {n+1}",
                              "txdate":filing_date-timedelta(days=2),"shares":rng.randint(100,1000),
                              "price":rng.uniform(50,500),"value":0})
        start=date(2024,1,1)
        for cik,ticker,*_ in COMPANIES:
            price=100+rng.random()*100
            for i in range(180):
                d=start+timedelta(days=i)
                price=max(5,price*(1+rng.uniform(-0.02,0.02)))
                conn.execute(text("""INSERT INTO daily_prices(ticker,price_date,open_price,high_price,low_price,close_price,adj_close,volume)
                                     VALUES(:ticker,:d,:op,:hi,:lo,:cl,:adj,:vol)"""),
                             {"ticker":ticker,"d":d,"op":price*0.995,"hi":price*1.02,"lo":price*0.98,
                              "cl":price,"adj":price,"vol":rng.randint(100000,10000000)})
    print("Synthetic prototype data seeded.")
