import secrets
def make_secret_code()->str:
    a= secrets.token_hex(nbytes=4)
    b=[]
    mid = len(a)//2
    for i,c in enumerate(a):
        if i<mid:
            b.append(c)
        else:
            b.append(c.upper())
    a="".join(b)
    del b
    del mid
    return a;
    
if __name__=="__main__":
    print(f"Secret room id: {make_secret_code()}")