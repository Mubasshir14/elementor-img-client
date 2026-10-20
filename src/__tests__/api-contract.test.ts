import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { api, apiClient } from '../lib/api';

afterEach(() => vi.restoreAllMocks());
function respond(body: unknown) {
  apiClient.defaults.adapter = async (config: InternalAxiosRequestConfig) => ({ data: body, status:200,statusText:'OK',headers:{},config } as AxiosResponse);
}
describe('Upload API response contract', () => {
  it('sends the backend image/name form fields and returns the associated source job', async () => {
    const body={success:true,data:{project:{id:'project'},job:{id:'job',projectId:'project',sourceAssetId:'asset'},asset:{id:'asset'}}};
    respond(body);
    const post=vi.spyOn(apiClient,'post');
    const result=await api.upload.uploadImage(new File(['image'],'image.webp',{type:'image/webp'}),'Landing');
    expect(result.job.id).toBe('job');
    expect(post.mock.calls[0][0]).toBe('/upload');
    const form=post.mock.calls[0][1] as FormData;
    expect(form.get('name')).toBe('Landing');expect((form.get('image') as File).type).toBe('image/webp');
  });
  it.each([null,'<html>error</html>',{success:false,error:{message:'Image cannot be decoded'}},{success:true,data:{}},
    {success:true,data:{project:{id:'p'},job:{id:'j',projectId:'other',sourceAssetId:'a'},asset:{id:'a'}}}])('rejects malformed or unsuccessful response %#', async body => {
    respond(body);
    await expect(api.upload.uploadImage(new File(['image'],'image.png'))).rejects.toThrow();
  });
  it('surfaces actionable backend errors', async () => {
    respond({success:false,error:{message:'Source screenshot could not be retrieved'}});
    await expect(api.jobs.getJob('job')).rejects.toThrow('Source screenshot could not be retrieved');
  });
});
