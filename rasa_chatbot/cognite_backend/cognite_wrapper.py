from cognite.client import CogniteClient
import os


sdk = CogniteClient(os.environ.get('COGNITE_API_KEY'), client_name='chatbot-demo',
                    project=os.environ.get('COGNITE_PROJECT', 'akerbp'))


def get_asset_info(asset_name: str):
    global sdk
    asset = sdk.assets.search(name=asset_name, limit=1)
    return asset[0]


def get_timeseries_of_asset(asset_id: int):
    global sdk
    timeseries = sdk.time_series.list(asset_ids=[asset_id])
    print(timeseries)
    return timeseries


def get_documents_of_asset(asset_id: int):
    global sdk
    files = sdk.files.list(asset_ids=[asset_id])
    print(files)
    return files


def get_pdf_of_asset(asset_id: int):
    global sdk
    pdfs = sdk.files.list(asset_ids=[asset_id], mime_type='application/pdf')
    pdfs.extend(sdk.files.list(asset_ids=[asset_id], mime_type='pdf'))
    print(pdfs)
    return pdfs


def get_root_asset(asset_id: int):
    global sdk
    asset = sdk.assets.retrieve(id=asset_id)
    asset = sdk.assets.retrieve(id=asset.root_id)
    return asset
